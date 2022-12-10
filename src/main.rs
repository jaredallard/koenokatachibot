use tokio_cron_scheduler::{Job, JobScheduler};

mod config;
mod parser;
mod poster;
mod storage;

#[tokio::main]
async fn main() {
    let conf = config::load_config();

    println!("Loaded configuration");
    println!("Mastodon URL: {}", conf.masto.url);
    println!("Cron: {}", conf.settings.post_cron);
    println!("Paths: {:?}", conf.video.paths);

    let mut scheduler = JobScheduler::new()
        .await
        .expect("Failed to create scheduler");

    let post_cron = conf.settings.post_cron.to_owned();
    let job = Job::new_async(post_cron.as_str(), |_, _| {
        Box::pin(async {
            let mut db = storage::load_storage().expect("Failed to load storage");
            let conf = config::load_config();

            println!("Starting Image Post Job");
            let screenshot_path = parser::get_current_screenshot(&mut db, &conf)
                .expect("Failed to get current screenshot");

            // index + 1 because we want to start at 1
            let episode = db.current_movie + 1;
            let seconds = db.current_post - conf.settings.movie_increment;
            poster::upload_image_to_mastodon(
                &conf,
                &screenshot_path,
                format!("Ep {} - {}:{}", episode, seconds % 60, (seconds / 60) % 60).as_str(),
            )
            .await
            .expect("Failed to upload image to mastodon");

            println!("Finished Image Post Job");
        })
    })
    .expect("Failed to create job");

    // add the post_cron job to the scheduler
    scheduler
        .add(job)
        .await
        .expect("Failed to add job to scheduler");

    scheduler.shutdown_on_ctrl_c();

    // start the scheduler
    scheduler.start().await.expect("Failed to start scheduler");

    // wait for ctrl-c
    tokio::signal::ctrl_c()
        .await
        .expect("Could not await ctrl-c");

    if let Err(err) = scheduler.shutdown().await {
        println!("{:?}", err);
    }
}
