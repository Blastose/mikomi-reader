use crate::models;
use crate::schema;
use base64::{engine::general_purpose, Engine as _};
use diesel::prelude::*;
use diesel::{Connection, SqliteConnection};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use epub::doc::EpubDoc;
use image::imageops;
use image::GenericImageView;
use serde::Serialize;
use specta::Type;
use std::error::Error;
use std::fs;
use std::fs::File;
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

struct BookWithAuthors {
    book: models::Book,
    authors: Vec<models::Author>,
}

#[derive(Serialize, Type)]
pub struct BookWithAuthorsAndCover {
    #[serde(flatten)]
    book: models::Book,
    authors: Vec<models::Author>,
    cover: Option<String>,
}

#[derive(Serialize, Type)]
pub struct BookWithAuthorsAndCoverAndBookmarks {
    #[serde(flatten)]
    book: models::Book,
    authors: Vec<models::Author>,
    bookmarks: Vec<models::Bookmark>,
    cover: Option<String>,
}

#[tauri::command]
#[specta::specta]
pub fn add_bookmark(new_bookmark: models::Bookmark) -> Result<(), String> {
    let mut conn: SqliteConnection = establish_connection();
    let res = diesel::insert_into(schema::bookmark::table)
        .values(&new_bookmark)
        .execute(&mut conn);

    match res {
        Ok(_) => return Ok(()),
        Err(_) => return Err(String::from("Cannot add bookmark")),
    }
}

#[tauri::command]
#[specta::specta]
pub fn remove_bookmark(id: String) -> Result<(), String> {
    let mut conn: SqliteConnection = establish_connection();

    let res = diesel::delete(schema::bookmark::table.filter(schema::bookmark::id.eq(id)))
        .execute(&mut conn);

    match res {
        Ok(_) => return Ok(()),
        Err(_) => return Err(String::from("Cannot delete bookmark")),
    }
}

#[tauri::command]
#[specta::specta]
pub fn update_bookmark(id: String, display_text: String) -> Result<(), String> {
    let mut conn: SqliteConnection = establish_connection();

    let res = diesel::update(schema::bookmark::table.filter(schema::bookmark::id.eq(id)))
        .set(schema::bookmark::display_text.eq(display_text))
        .execute(&mut conn);

    match res {
        Ok(_) => return Ok(()),
        Err(_) => return Err(String::from("Cannot update bookmark")),
    }
}

#[tauri::command]
#[specta::specta]
pub fn get_book(id: String) -> Option<BookWithAuthorsAndCoverAndBookmarks> {
    let mut conn: SqliteConnection = establish_connection();

    let books: Vec<models::Book> = schema::book::table
        .filter(schema::book::id.eq(id))
        .select(models::Book::as_select())
        .get_results(&mut conn)
        .unwrap();

    let bookmarks: Vec<models::Bookmark> = models::Bookmark::belonging_to(&books)
        .select(models::Bookmark::as_select())
        .load(&mut conn)
        .unwrap();

    let authors_with_book_link: Vec<(models::BookAuthorLink, models::Author)> =
        models::BookAuthorLink::belonging_to(&books)
            .inner_join(schema::author::table)
            .select((
                models::BookAuthorLink::as_select(),
                models::Author::as_select(),
            ))
            .load::<(models::BookAuthorLink, models::Author)>(&mut conn)
            .unwrap();

    let book = match books.into_iter().nth(0) {
        Some(v) => v,
        None => return None,
    };

    let path = Path::new("mikomi-data/covers").join(book.id.clone());
    let cover = fs::read(path);
    let engine = general_purpose::STANDARD_NO_PAD;
    let cover = match cover {
        Ok(c) => {
            let encoded = engine.encode(c);
            Some(encoded)
        }
        Err(_) => None,
    };

    Some(BookWithAuthorsAndCoverAndBookmarks {
        book,
        authors: authors_with_book_link.into_iter().map(|(_, a)| a).collect(),
        bookmarks,
        cover,
    })
}

#[tauri::command]
#[specta::specta]
pub fn get_books() -> Vec<BookWithAuthorsAndCover> {
    let engine = general_purpose::STANDARD_NO_PAD;
    let mut conn: SqliteConnection = establish_connection();

    let all_books = schema::book::table
        .select(models::Book::as_select())
        .load(&mut conn)
        .unwrap();

    let authors_with_book_link: Vec<(models::BookAuthorLink, models::Author)> =
        models::BookAuthorLink::belonging_to(&all_books)
            .inner_join(schema::author::table)
            .select((
                models::BookAuthorLink::as_select(),
                models::Author::as_select(),
            ))
            .load::<(models::BookAuthorLink, models::Author)>(&mut conn)
            .unwrap();

    let books_with_authors: Vec<BookWithAuthors> = authors_with_book_link
        .grouped_by(&all_books)
        .into_iter()
        .zip(all_books)
        .map(|(a, b)| BookWithAuthors {
            book: b,
            authors: a.into_iter().map(|(_, b)| b).collect(),
        })
        .collect();

    let books_with_authors_and_cover: Vec<BookWithAuthorsAndCover> = books_with_authors
        .into_iter()
        .map(|book| {
            let path = Path::new("mikomi-data/covers").join(book.book.id.clone());
            let cover = fs::read(path);
            let cover = match cover {
                Ok(c) => {
                    let encoded = engine.encode(c);
                    Some(encoded)
                }
                Err(_) => None,
            };

            BookWithAuthorsAndCover {
                book: book.book,
                authors: book.authors,
                cover,
            }
        })
        .collect();

    books_with_authors_and_cover
}

pub fn upsert_author(name: String) -> String {
    let mut conn = establish_connection();

    let id_result: Result<Vec<String>, diesel::result::Error> = schema::author::table
        .filter(schema::author::name.eq(name.clone()))
        .select(schema::author::id)
        .load::<String>(&mut conn);

    let id = id_result.unwrap();
    let first = id.first();
    let id;

    match first {
        Some(v) => id = v.clone(),
        None => {
            let new_id = Uuid::new_v4().to_string();

            let new_author = models::Author {
                name: name.clone(),
                id: new_id.clone(),
            };

            diesel::insert_into(schema::author::table)
                .values(&new_author)
                .execute(&mut conn)
                .expect("Error adding new author");

            id = new_id;
        }
    }

    id
}

fn insert_book_author_link(book_id: String, author_id: String, primary: bool) {
    let mut conn = establish_connection();
    let new_book_author_link = models::BookAuthorLink {
        book_id,
        author_id,
        primary_creator: primary,
    };

    diesel::insert_into(schema::book_author_link::table)
        .values(&new_book_author_link)
        .execute(&mut conn)
        .expect("Error adding new book");
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
pub async fn add_book_from_file(path: String) -> Result<models::Book, String> {
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
                Err(_) => return Err(String::from("Error saving epub cover")),
            }
        }
        None => return Err(String::from("No cover found in epub")),
    }

    let empty_vec = vec![];
    let authors = doc.metadata.get("creator").unwrap_or(&empty_vec);
    let mut author_ids: Vec<String> = vec![];
    for a in authors {
        let id = upsert_author(a.to_string());
        author_ids.push(id);
    }

    let title_res = doc.mdata("title");
    let title;
    match title_res {
        Some(v) => title = v,
        None => return Err(String::from("Epub does not have a title")),
    }
    let new_book = models::Book {
        title,
        path,
        id: uuid.clone(),
    };

    let res = diesel::insert_into(schema::book::table)
        .values(&new_book)
        .execute(&mut conn);

    match res {
        Ok(_) => (),
        Err(_) => return Err(String::from("Cannot add epub to database")),
    }

    for (i, author_id) in author_ids.iter().enumerate() {
        let primary = i == 0;
        insert_book_author_link(uuid.clone(), author_id.to_string(), primary);
    }

    Ok(new_book)
}

#[tauri::command]
#[specta::specta]
pub async fn add_multiple_books_from_files(paths: Vec<String>) -> Result<(), String> {
    for path in paths {
        let res = add_book_from_file(path).await;
        match res {
            Ok(_) => (),
            Err(e) => {
                println!("{e}");
                return Err(String::from("Error adding book"));
            }
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::{establish_connection, run_migrations};

    #[test]
    fn it_establishes_a_connection() {
        establish_connection();
    }

    #[test]
    fn it_runs_migrations() {
        let res = run_migrations(&mut establish_connection());
        match res {
            Ok(_) => (),
            Err(_) => panic!(),
        }
    }
}
