use serde::{Deserialize, Serialize};
use std::{fs, io::Write};

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Storage {
    #[serde(default)]
    pub current_movie: u64,
    #[serde(default)]
    pub current_post: u64,
}

// loads the storage file from disk, if it doesn't exist, it creates it
pub fn load_storage() -> Result<Storage, Box<dyn std::error::Error>> {
    let file = match fs::File::open("config/db.json") {
        Ok(file) => file,
        Err(_) => {
            let mut file = fs::File::create("config/db.json")?;
            file.write(b"{}")?;
            return Ok(Storage::default());
        }
    };

    let storage = serde_json::from_reader(file)?;

    Ok(storage)
}

// saves the storage file to disk
pub fn save_storage(storage: &Storage) -> Result<(), Box<dyn std::error::Error>> {
    let mut file = fs::File::create("config/db.json")?;
    file.write(serde_json::to_string(storage)?.as_bytes())?;

    Ok(())
}
