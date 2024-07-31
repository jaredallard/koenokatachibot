use std::error::Error;
use std::path::Path;

use megalodon::entities::UploadMedia;
use megalodon::megalodon::{PostStatusInputOptions, PostStatusOutput, UploadMediaInputOptions};

use crate::config::Config;

// uploads an image to mastodon from the provided path
// using the provided config and status
pub async fn upload_image_to_mastodon(
    conf: &Config,
    image_path: &Path,
    status: &str,
) -> Result<(), Box<dyn Error>> {
    // TODO(jaredallard): This should be configurable.
    let client = megalodon::generator(
        megalodon::SNS::Pleroma,
        conf.masto.url.to_string(),
        Some(conf.masto.access_token.to_string()),
        None,
    );

    // upload the image
    let media_req = client
        .upload_media(
            image_path.to_string_lossy().to_string(),
            Some(&UploadMediaInputOptions {
                description: Some(status.to_string()),
                ..Default::default()
            }),
        )
        .await?
        .json();

    // check if we're an attachment, and if so post the status
    if let UploadMedia::Attachment(media) = media_req {
        // create a status with the media attached
        let status_out = client
            .post_status(
                status.to_string(),
                Some(&PostStatusInputOptions {
                    media_ids: Some(vec![media.id]),
                    language: Some("en".to_string()),
                    ..Default::default()
                }),
            )
            .await?
            .json();

        let status = match status_out {
            PostStatusOutput::Status(status) => status,
            // We don't ever post anything else
            _ => unreachable!(),
        };
        println!("Posted status: {:?} (media: {})", status.url, media.url);
    } else {
        Err("Failed to upload image to Mastodon".to_string())?;
    }

    Ok(())
}
