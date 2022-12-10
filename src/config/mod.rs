use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    pub masto: Masto,
    pub video: Video,
    pub settings: Settings,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Masto {
    pub url: String,
    pub access_token: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Video {
    pub paths: Vec<String>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    #[serde(rename = "post_cron")]
    pub post_cron: String,
    #[serde(rename = "movie_increment")]
    pub movie_increment: u64,
}

pub fn load_config() -> Config {
    serde_json::from_reader(fs::File::open("config/config.json").expect("missing config")).unwrap()
}
