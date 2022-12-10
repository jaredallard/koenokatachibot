use std::error::Error;
use std::path::{Path, PathBuf};
use std::process::Command;

use crate::config::Config;
use crate::storage::{save_storage, Storage};

// gets the length of a movie in seconds
fn get_movie_length(path: &Path) -> u64 {
    let output = Command::new("ffprobe")
        .arg("-v")
        .arg("error")
        .arg("-show_entries")
        .arg("format=duration")
        .arg("-of")
        .arg("default=noprint_wrappers=1:nokey=1")
        .arg(path.to_string_lossy().to_string())
        .output()
        .expect("failed to execute process");

    let duration = String::from_utf8_lossy(&output.stdout);
    let duration = duration
        .trim()
        .parse::<f64>()
        .expect("Failed to parse duration");
    duration as u64
}

// extracts a screenshot from a movie at the given timestamp
fn extract_screenshot(
    path: &Path,
    output_path: &Path,
    timestamp: u64,
) -> Result<std::process::Output, std::io::Error> {
    Command::new("ffmpeg")
        .arg("-i")
        .arg(path.to_string_lossy().to_string())
        .arg("-ss")
        .arg(timestamp.to_string())
        .arg("-copyts")
        .arg("-vframes")
        .arg("1")
        .arg("-vf")
        .arg(format!(
            "subtitles='{}':stream_index=1",
            path.to_string_lossy()
        ))
        .arg(output_path.to_string_lossy().to_string())
        .output()
}

// returns the current snapshot for the movie in the storage
// according to the config
pub fn get_current_screenshot(
    db: &mut Storage,
    config: &Config,
) -> Result<PathBuf, Box<dyn Error>> {
    let movies = &config.video.paths;
    let current_movie_index = db.current_movie;
    let movie = movies
        .get(current_movie_index as usize)
        .expect("No movie found");
    let movie_path = Path::new(movie);
    let screenshot_path = Path::new("timestamps");

    let length = get_movie_length(movie_path);
    println!("File {} is {} seconds long", movie, length);

    let ts = db.current_post;
    let percent = (ts / length) * 100;
    println!("ts {} / {} ({}%)", ts, length, percent);

    let screenshot_path = screenshot_path.join(format!("{}.png", ts));

    extract_screenshot(movie_path, screenshot_path.as_path(), ts)?;

    db.current_post += config.settings.movie_increment;
    if db.current_post > length {
        // reset the current ts and increment the movie
        db.current_post = 0;
        db.current_movie += 1;

        // check if we're at the end of the movies
        if db.current_movie > config.video.paths.len() as u64 {
            db.current_movie = 0;
        }
    }
    save_storage(db)?;

    Ok(screenshot_path)
}
