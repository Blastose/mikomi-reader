use crate::models;
use crate::schema;
use base64::{engine::general_purpose, Engine as _};
use diesel::prelude::*;
use diesel::{Connection, SqliteConnection};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use epub::doc::EpubDoc;
use image::GenericImageView;
use image::ImageBuffer;
use image::{imageops, open, DynamicImage, ImageFormat};
use serde::Serialize;
use specta::Type;
use std::error::Error;
use std::fs;
use std::fs::File;
use std::io::BufWriter;
use std::io::Cursor;
use std::io::Write;
use std::path::Path;
use uuid::Uuid;

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

pub fn establish_connection() -> SqliteConnection {
    let _ = fs::create_dir_all("mikomi-data").unwrap();
    let database_url = "mikomi-data/db.sqlite";

    SqliteConnection::establish(&database_url)
        .expect(&format!("Error connecting to {}", database_url))
}

pub fn run_migrations(
    conn: &mut SqliteConnection,
) -> Result<(), Box<dyn Error + Send + Sync + 'static>> {
    conn.run_pending_migrations(MIGRATIONS)?;

    Ok(())
}

fn map_mime_type_to_file_extension(mime_type: &str) -> Option<&str> {
    return match mime_type {
        "image/png" => Some("png"),
        "image/jpeg" => Some("jpg"),
        "image/gif" => Some("gif"),
        "image/svg+xml" => Some("svg"),
        _ => None,
    };
}

#[derive(Serialize, Type)]
pub struct BookWithCover {
    book: models::Book,
    cover: Option<Vec<u8>>,
}

#[tauri::command]
#[specta::specta]
pub fn get_books() -> Vec<BookWithCover> {
    let mut conn: SqliteConnection = establish_connection();
    let books = schema::book::table
        .select(models::Book::as_select())
        .load(&mut conn)
        .unwrap_or(vec![]);

    let books_with_cover = books
        .into_iter()
        .map(|book| {
            let path = Path::new("mikomi-data/covers").join(book.id.clone());
            let cover = fs::read(path);
            let cover: Option<Vec<u8>> = match cover {
                Ok(c) => Some(c),
                Err(_) => None,
            };

            BookWithCover { book, cover }
        })
        .collect();
    books_with_cover
}

#[derive(Serialize, Type)]
pub struct BookWithCover2 {
    book: models::Book,
    cover: Option<String>,
}

#[tauri::command]
#[specta::specta]
pub fn get_books_base64() -> Vec<BookWithCover2> {
    let engine = general_purpose::STANDARD_NO_PAD;

    let mut conn: SqliteConnection = establish_connection();
    let books = schema::book::table
        .select(models::Book::as_select())
        .load(&mut conn)
        .unwrap_or(vec![]);

    let books_with_cover = books
        .into_iter()
        .map(|book| {
            let path = Path::new("mikomi-data/covers").join(book.id.clone());
            let cover = fs::read(path);
            let cover = match cover {
                Ok(c) => {
                    let encoded = engine.encode(c);
                    Some(encoded)
                }
                Err(_) => None,
            };

            BookWithCover2 { book, cover }
        })
        .collect();
    books_with_cover
}

#[tauri::command]
#[specta::specta]
pub fn add_book(title: String, path: String) -> models::Book {
    let mut conn: SqliteConnection = establish_connection();
    let new_book = models::Book {
        title,
        path,
        id: Uuid::new_v4().to_string(),
    };

    diesel::insert_into(schema::book::table)
        .values(&new_book)
        .execute(&mut conn)
        .expect("Error adding new book");
    new_book
}

fn scale_image(image_data: Vec<u8>, max_height: u32) -> Result<Vec<u8>, String> {
    let format = image::guess_format(&image_data).unwrap();
    let image = image::load_from_memory(&image_data).unwrap();

    let (width, height) = image.dimensions();

    let new_height = if height > max_height {
        max_height
    } else {
        height
    };

    let new_width = (width as f32 * (new_height as f32 / height as f32)) as u32;
    let scaled_image =
        imageops::resize(&image, new_width, new_height, imageops::FilterType::Nearest);

    let mut scaled_image_data = Cursor::new(Vec::new());
    scaled_image
        .write_to(&mut scaled_image_data, format)
        .unwrap();

    Ok(scaled_image_data.into_inner())
}

fn write_cover_to_file(
    cover_data: (Vec<u8>, String),
    path: std::path::PathBuf,
) -> Result<(), String> {
    let res = fs::create_dir_all("mikomi-data/covers");
    match res {
        Ok(_) => (),
        Err(e) => return Err(e.to_string()),
    }

    let res = File::create(path);
    let mut file;
    match res {
        Ok(f) => file = f,
        Err(e) => return Err(e.to_string()),
    }
    let cover = cover_data.0;
    let res = file.write_all(&cover);
    match res {
        Ok(_) => (),
        Err(e) => return Err(e.to_string()),
    }

    Ok(())
}

#[tauri::command]
#[specta::specta]
pub fn add_book_from_file(path: String) -> Result<models::Book, String> {
    let mut conn: SqliteConnection = establish_connection();

    let mut doc = EpubDoc::new(path.clone()).map_err(|_| String::from("Cannot read epub file"))?;

    let uuid = Uuid::new_v4().to_string();

    let cover_op = doc.get_cover();
    match cover_op {
        Some(data) => {
            let a = scale_image(data.0, 340).unwrap();

            match write_cover_to_file(
                (a, data.1),
                Path::new("mikomi-data/covers").join(uuid.clone()),
            ) {
                Ok(_) => (),
                Err(e) => return Err(String::from("Error saving epub cover")),
            }
        }
        None => return Err(String::from("No cover found in epub")),
    }

    // TODO change unwrap to match
    let title = doc.mdata("title").unwrap();
    let new_book = models::Book {
        title,
        path,
        id: uuid,
    };

    let res = diesel::insert_into(schema::book::table)
        .values(&new_book)
        .execute(&mut conn);

    match res {
        Ok(_) => (),
        Err(e) => return Err(String::from("Cannot add epub to database")),
    }

    Ok(new_book)
}

#[tauri::command]
#[specta::specta]
pub fn add_multiple_books_from_files(paths: Vec<String>) -> Result<(), String> {
    for path in paths {
        let _ = add_book_from_file(path).map_err(|e| e.to_string());
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use crate::db::add_book_from_file;

    #[test]
    fn it_words() {
        assert_eq!(1, 1);
    }
}
