use crate::models;
use crate::schema;
use diesel::prelude::*;
use diesel::{Connection, SqliteConnection};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use epub::doc::EpubDoc;
use serde::Deserialize;
use serde::Serialize;
use specta::Type;
use std::error::Error;
use std::fs;
use std::fs::File;
use std::io::Write;
use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};
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
pub struct BookWithAuthorsAndCoverAndSettingsAndCollections {
    #[serde(flatten)]
    book: models::Book,
    authors: Vec<models::Author>,
    cover: Option<String>,
    settings: Option<models::BookSettings>,
    collections: Vec<models::Collection>,
}

#[derive(Serialize, Type)]
pub struct BookWithAuthorsAndCoverAndBookmarksAndHighlightsAndSettingsAndCollections {
    #[serde(flatten)]
    book: models::Book,
    authors: Vec<models::Author>,
    bookmarks: Vec<models::Bookmark>,
    highlights: Vec<models::Highlight>,
    collections: Vec<models::Collection>,
    cover: Option<String>,
    settings: Option<models::BookSettings>,
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
pub fn get_languages() -> Vec<models::Language> {
    let mut conn: SqliteConnection = establish_connection();
    schema::language::table
        .select(models::Language::as_select())
        .get_results(&mut conn)
        .unwrap()
}

#[tauri::command]
#[specta::specta]
pub fn add_book_settings(new_book_settings: models::BookSettings) -> Result<(), String> {
    let mut conn: SqliteConnection = establish_connection();
    let res = diesel::insert_into(schema::book_settings::table)
        .values(&new_book_settings)
        .on_conflict(schema::book_settings::book_id)
        .do_update()
        .set(&new_book_settings)
        .execute(&mut conn);

    match res {
        Ok(_) => return Ok(()),
        Err(e) => {
            println!("{e}");
            return Err(String::from("Cannot add book settings"));
        }
    }
}

#[tauri::command]
#[specta::specta]
pub fn remove_book_settings(id: String) -> Result<(), String> {
    let mut conn: SqliteConnection = establish_connection();
    let res = diesel::delete(schema::book_settings::table.filter(schema::book_settings::id.eq(id)))
        .execute(&mut conn);

    match res {
        Ok(_) => return Ok(()),
        Err(_) => return Err(String::from("Cannot delete book settings")),
    }
}

#[tauri::command]
#[specta::specta]
pub fn update_book_settings(
    book_id: String,
    new_book_settings: models::BookSettings,
) -> Result<(), String> {
    let mut conn: SqliteConnection = establish_connection();
    let res = diesel::update(
        schema::book_settings::table.filter(schema::book_settings::book_id.eq(book_id)),
    )
    .set(&new_book_settings)
    .execute(&mut conn);

    match res {
        Ok(_) => return Ok(()),
        Err(_) => return Err(String::from("Cannot update book settings")),
    }
}

#[tauri::command]
#[specta::specta]
pub fn get_reader_themes() -> Vec<models::ReaderTheme> {
    let mut conn: SqliteConnection = establish_connection();

    let themes: Vec<models::ReaderTheme> = schema::reader_theme::table
        .select(models::ReaderTheme::as_select())
        .get_results(&mut conn)
        .unwrap();

    themes
}

#[tauri::command]
#[specta::specta]
pub fn add_reader_theme(new_reader_theme: models::ReaderTheme) -> Result<(), String> {
    let mut conn: SqliteConnection = establish_connection();
    let res = diesel::insert_into(schema::reader_theme::table)
        .values(&new_reader_theme)
        .on_conflict(schema::reader_theme::id)
        .do_update()
        .set(&new_reader_theme)
        .execute(&mut conn);

    match res {
        Ok(_) => return Ok(()),
        Err(_) => return Err(String::from("Cannot add reader theme")),
    }
}

#[tauri::command]
#[specta::specta]
pub fn remove_reader_theme(id: String) -> Result<(), String> {
    let mut conn: SqliteConnection = establish_connection();
    let res = diesel::delete(schema::reader_theme::table.filter(schema::reader_theme::id.eq(id)))
        .execute(&mut conn);

    match res {
        Ok(_) => return Ok(()),
        Err(_) => return Err(String::from("Cannot delete reader theme")),
    }
}

#[tauri::command]
#[specta::specta]
pub fn update_reader_theme(id: String, name: String) -> Result<(), String> {
    let mut conn: SqliteConnection = establish_connection();
    let res = diesel::update(schema::reader_theme::table.filter(schema::reader_theme::id.eq(id)))
        .set((schema::reader_theme::name.eq(name),))
        .execute(&mut conn);

    match res {
        Ok(_) => return Ok(()),
        Err(_) => return Err(String::from("Cannot update reader theme")),
    }
}

#[tauri::command]
#[specta::specta]
pub fn get_collections() -> Vec<models::Collection> {
    let mut conn: SqliteConnection = establish_connection();

    schema::collection::table
        .select(models::Collection::as_select())
        .order(schema::collection::sort_order)
        .get_results(&mut conn)
        .unwrap()
}

#[tauri::command]
#[specta::specta]
pub fn add_collection(new_collection: models::Collection) -> Result<(), String> {
    let mut conn: SqliteConnection = establish_connection();
    let res = diesel::insert_into(schema::collection::table)
        .values(&new_collection)
        .on_conflict(schema::collection::id)
        .do_update()
        .set(&new_collection)
        .execute(&mut conn);

    match res {
        Ok(_) => return Ok(()),
        Err(_) => return Err(String::from("Cannot add collection")),
    }
}

#[derive(Serialize, Deserialize, Type)]
pub struct CollectionIdWithSortOrder {
    pub id: String,
    pub sort_order: i32,
}

#[tauri::command]
#[specta::specta]
pub fn reorder_collections(collections: Vec<CollectionIdWithSortOrder>) -> Result<(), String> {
    let mut conn: SqliteConnection = establish_connection();
    let res = conn.transaction(|conn| {
        for col in collections {
            diesel::update(schema::collection::table.filter(schema::collection::id.eq(col.id)))
                .set(schema::collection::sort_order.eq(col.sort_order))
                .execute(conn)?;
        }

        diesel::result::QueryResult::Ok(())
    });

    match res {
        Ok(_) => return Ok(()),
        Err(_) => return Err(String::from("Cannot reorder collections")),
    }
}

#[tauri::command]
#[specta::specta]
pub fn update_collection_name(id: String, name: String) -> Result<(), String> {
    let mut conn: SqliteConnection = establish_connection();

    let res = diesel::update(schema::collection::table.filter(schema::collection::id.eq(id)))
        .set(schema::collection::name.eq(name))
        .execute(&mut conn);

    match res {
        Ok(_) => return Ok(()),
        Err(_) => return Err(String::from("Cannot update collection")),
    }
}

#[tauri::command]
#[specta::specta]
pub fn remove_collection(id: String) -> Result<(), String> {
    let mut conn: SqliteConnection = establish_connection();

    let res = conn.transaction(|conn| {
        diesel::delete(
            schema::book_collection_link::table
                .filter(schema::book_collection_link::collection_id.eq(id.clone())),
        )
        .execute(conn)?;

        diesel::delete(schema::collection::table.filter(schema::collection::id.eq(id)))
            .execute(conn)?;

        diesel::result::QueryResult::Ok(())
    });

    match res {
        Ok(_) => return Ok(()),
        Err(_) => return Err(String::from("Cannot delete collection")),
    }
}

#[tauri::command]
#[specta::specta]
pub fn reorder_books_in_collection(
    book_collection_links: Vec<models::BookCollectionLink>,
) -> Result<(), String> {
    let mut conn: SqliteConnection = establish_connection();
    let res = conn.transaction(|conn| {
        for book_collection_link in book_collection_links {
            diesel::update(
                schema::book_collection_link::table
                    .filter(schema::book_collection_link::book_id.eq(book_collection_link.book_id))
                    .filter(
                        schema::book_collection_link::collection_id
                            .eq(book_collection_link.collection_id),
                    ),
            )
            .set(schema::book_collection_link::sort_order.eq(book_collection_link.sort_order))
            .execute(conn)?;
        }

        diesel::result::QueryResult::Ok(())
    });

    match res {
        Ok(_) => return Ok(()),
        Err(_) => return Err(String::from("Cannot reorder books in collection")),
    }
}

#[tauri::command]
#[specta::specta]
pub fn add_book_to_collections(book_id: String, collection_ids: Vec<String>) -> Result<(), String> {
    let mut conn: SqliteConnection = establish_connection();

    let res = conn.transaction(|conn| {
        let book_collection_links: Vec<models::BookCollectionLink> =
            schema::book_collection_link::table
                .filter(schema::book_collection_link::book_id.eq(book_id.clone()))
                .select(models::BookCollectionLink::as_select())
                .load(conn)?;

        let old_collection_ids: Vec<String> = book_collection_links
            .into_iter()
            .map(|v| v.collection_id)
            .collect();

        let to_remove: Vec<String> = old_collection_ids
            .clone()
            .into_iter()
            .filter(|v| !collection_ids.contains(v))
            .collect();

        let to_add: Vec<String> = collection_ids
            .into_iter()
            .filter(|v| !old_collection_ids.contains(v))
            .collect();

        for collection_id in to_remove {
            diesel::delete(
                schema::book_collection_link::table
                    .filter(schema::book_collection_link::book_id.eq(book_id.clone()))
                    .filter(schema::book_collection_link::collection_id.eq(collection_id)),
            )
            .execute(conn)?;
        }

        for collection_id in to_add {
            let links: Vec<models::BookCollectionLink> = schema::book_collection_link::table
                .filter(schema::book_collection_link::collection_id.eq(collection_id.clone()))
                .select(models::BookCollectionLink::as_select())
                .order(schema::book_collection_link::sort_order.desc())
                .load(conn)?;
            let first_link = links.first();

            let count = match first_link {
                Some(v) => v.sort_order,
                None => Some(0),
            };
            let count = match count {
                Some(v) => v,
                None => 0,
            };

            let count: i32 = (count + 1).try_into().unwrap();

            diesel::insert_into(schema::book_collection_link::table)
                .values((
                    schema::book_collection_link::book_id.eq(book_id.clone()),
                    schema::book_collection_link::collection_id.eq(collection_id),
                    schema::book_collection_link::sort_order.eq(count),
                ))
                .execute(conn)?;
        }

        diesel::result::QueryResult::Ok(())
    });

    match res {
        Ok(_) => return Ok(()),
        Err(_) => return Err(String::from("Cannot add book to collection")),
    }
}

#[tauri::command]
#[specta::specta]
pub fn remove_book_from_collection(book_id: String, collection_id: String) -> Result<(), String> {
    let mut conn: SqliteConnection = establish_connection();

    let res = diesel::delete(
        schema::book_collection_link::table.filter(
            schema::book_collection_link::collection_id
                .eq(collection_id)
                .and(schema::book_collection_link::book_id.eq(book_id)),
        ),
    )
    .execute(&mut conn);

    match res {
        Ok(_) => return Ok(()),
        Err(_) => return Err(String::from("Cannot remove book from collection")),
    }
}

#[tauri::command]
#[specta::specta]
pub fn add_highlight(new_highlight: models::Highlight) -> Result<(), String> {
    let mut conn: SqliteConnection = establish_connection();
    let res = diesel::insert_into(schema::highlight::table)
        .values(&new_highlight)
        .on_conflict(schema::highlight::id)
        .do_update()
        .set(&new_highlight)
        .execute(&mut conn);

    match res {
        Ok(_) => return Ok(()),
        Err(_) => return Err(String::from("Cannot add highlight")),
    }
}

#[tauri::command]
#[specta::specta]
pub fn remove_highlight(id: String) -> Result<(), String> {
    let mut conn: SqliteConnection = establish_connection();
    let res = diesel::delete(schema::highlight::table.filter(schema::highlight::id.eq(id)))
        .execute(&mut conn);

    match res {
        Ok(_) => return Ok(()),
        Err(_) => return Err(String::from("Cannot delete highlight")),
    }
}

#[tauri::command]
#[specta::specta]
pub fn update_highlight(id: String, note: String, color: String) -> Result<(), String> {
    let mut conn: SqliteConnection = establish_connection();
    let res = diesel::update(schema::highlight::table.filter(schema::highlight::id.eq(id)))
        .set((
            schema::highlight::note.eq(note),
            schema::highlight::color.eq(color),
        ))
        .execute(&mut conn);

    match res {
        Ok(_) => return Ok(()),
        Err(_) => return Err(String::from("Cannot update highlight")),
    }
}

#[tauri::command]
#[specta::specta]
pub fn get_book(
    id: String,
) -> Option<BookWithAuthorsAndCoverAndBookmarksAndHighlightsAndSettingsAndCollections> {
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

    let highlights: Vec<models::Highlight> = models::Highlight::belonging_to(&books)
        .select(models::Highlight::as_select())
        .load(&mut conn)
        .unwrap();

    let settings: Vec<models::BookSettings> = models::BookSettings::belonging_to(&books)
        .select(models::BookSettings::as_select())
        .load(&mut conn)
        .unwrap();

    let settings = settings.into_iter().nth(0);

    let authors_with_book_link: Vec<(models::BookAuthorLink, models::Author)> =
        models::BookAuthorLink::belonging_to(&books)
            .inner_join(schema::author::table)
            .select((
                models::BookAuthorLink::as_select(),
                models::Author::as_select(),
            ))
            .load::<(models::BookAuthorLink, models::Author)>(&mut conn)
            .unwrap();

    let collections_with_book_link: Vec<(models::BookCollectionLink, models::Collection)> =
        models::BookCollectionLink::belonging_to(&books)
            .inner_join(schema::collection::table)
            .select((
                models::BookCollectionLink::as_select(),
                models::Collection::as_select(),
            ))
            .load::<(models::BookCollectionLink, models::Collection)>(&mut conn)
            .unwrap();

    let book = match books.into_iter().nth(0) {
        Some(v) => v,
        None => return None,
    };

    let path = Path::new("mikomi-data/covers").join(book.id.clone());

    Some(
        BookWithAuthorsAndCoverAndBookmarksAndHighlightsAndSettingsAndCollections {
            book,
            authors: authors_with_book_link.into_iter().map(|(_, a)| a).collect(),
            bookmarks,
            highlights,
            cover: Some(String::from(path.to_string_lossy())),
            settings,
            collections: collections_with_book_link
                .into_iter()
                .map(|(_, c)| c)
                .collect(),
        },
    )
}

#[tauri::command]
#[specta::specta]
pub fn get_books() -> Vec<BookWithAuthorsAndCoverAndSettingsAndCollections> {
    let mut conn: SqliteConnection = establish_connection();

    let all_books = schema::book::table
        .select(models::Book::as_select())
        .load(&mut conn)
        .unwrap();

    let mut settings: Vec<models::BookSettings> = models::BookSettings::belonging_to(&all_books)
        .select(models::BookSettings::as_select())
        .load(&mut conn)
        .unwrap();

    let mut collections_with_book_link: Vec<(models::BookCollectionLink, models::Collection)> =
        models::BookCollectionLink::belonging_to(&all_books)
            .inner_join(schema::collection::table)
            .select((
                models::BookCollectionLink::as_select(),
                models::Collection::as_select(),
            ))
            .load::<(models::BookCollectionLink, models::Collection)>(&mut conn)
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
        .map(|(book_author_link_with_author, book)| BookWithAuthors {
            book,
            authors: book_author_link_with_author
                .into_iter()
                .map(|(_, author)| author)
                .collect(),
        })
        .collect();

    let books_with_authors_and_cover: Vec<BookWithAuthorsAndCoverAndSettingsAndCollections> =
        books_with_authors
            .into_iter()
            .map(|book| {
                let path = Path::new("mikomi-data/covers").join(book.book.id.clone());

                let mut book_settings: Option<models::BookSettings> = None;
                for setting in &mut settings {
                    if setting.book_id == book.book.id {
                        book_settings = Some(setting.clone());
                        break;
                    }
                }

                let mut book_collections: Vec<models::Collection> = vec![];
                for book_collection_link_with_collection in &mut collections_with_book_link {
                    if book_collection_link_with_collection.0.book_id == book.book.id {
                        book_collections.push(book_collection_link_with_collection.1.clone());
                    }
                }

                BookWithAuthorsAndCoverAndSettingsAndCollections {
                    book: book.book,
                    authors: book.authors,
                    cover: Some(String::from(path.to_string_lossy())),
                    settings: book_settings,
                    collections: book_collections,
                }
            })
            .collect();

    books_with_authors_and_cover
}

#[derive(Serialize, Deserialize, Type)]
pub struct BookWithCover {
    #[serde(flatten)]
    pub book: models::Book,
    pub cover: Option<String>,
}
#[derive(Serialize, Deserialize, Type)]
pub struct CollectionWithBooks {
    pub collection: models::Collection,
    pub books: Vec<BookWithCover>,
}

#[tauri::command]
#[specta::specta]
pub fn get_books_belonging_to_collections(collection_id: String) -> CollectionWithBooks {
    let mut conn: SqliteConnection = establish_connection();

    let collection = schema::collection::table
        .filter(schema::collection::id.eq(collection_id))
        .select(models::Collection::as_select())
        .get_result(&mut conn)
        .unwrap();

    let books = models::BookCollectionLink::belonging_to(&collection)
        .inner_join(schema::book::table)
        .select(models::Book::as_select())
        .order(schema::book_collection_link::sort_order)
        .load(&mut conn)
        .unwrap();

    let books = books
        .into_iter()
        .map(|b| {
            let path = Path::new("mikomi-data/covers").join(b.id.clone());
            BookWithCover {
                book: b,
                cover: Some(String::from(path.to_string_lossy())),
            }
        })
        .collect();

    CollectionWithBooks { collection, books }
}

#[tauri::command]
#[specta::specta]
pub fn get_collections_and_their_books() -> Vec<CollectionWithBooks> {
    let mut conn: SqliteConnection = establish_connection();

    let all_collections = schema::collection::table
        .order(schema::collection::sort_order)
        .select(models::Collection::as_select())
        .load(&mut conn)
        .unwrap();

    let books_with_collection_link: Vec<(models::BookCollectionLink, models::Book)> =
        models::BookCollectionLink::belonging_to(&all_collections)
            .inner_join(schema::book::table)
            .order(schema::book_collection_link::sort_order)
            .select((
                models::BookCollectionLink::as_select(),
                models::Book::as_select(),
            ))
            .load::<(models::BookCollectionLink, models::Book)>(&mut conn)
            .unwrap();

    let books_per_collection = books_with_collection_link
        .grouped_by(&all_collections)
        .into_iter()
        .zip(all_collections)
        .map(|(links, col)| {
            let books = links
                .into_iter()
                .map(|(_, b)| {
                    let path = Path::new("mikomi-data/covers").join(b.id.clone());
                    BookWithCover {
                        book: b,
                        cover: Some(String::from(path.to_string_lossy())),
                    }
                })
                .collect();

            CollectionWithBooks {
                collection: col,
                books,
            }
        })
        .collect();

    books_per_collection
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
            match write_cover_to_file(
                (data.0, data.1),
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

    let language = doc.mdata("language");
    let description = doc.mdata("description");
    let identifier = doc.mdata("identifier");
    let last_modified = doc.mdata("dcterms:modified");
    let published_date = doc.mdata("date");
    let publisher = doc.mdata("publisher");

    let start = SystemTime::now();

    match language {
        Some(v) => {
            let _ = diesel::insert_into(schema::language::table)
                .values(models::Language { name: v })
                .on_conflict(schema::language::name)
                .do_nothing()
                .execute(&mut conn);
        }
        None => {}
    }

    let language = doc.mdata("language");
    let new_book = models::Book {
        title,
        path,
        id: uuid.clone(),
        last_read: None,
        date_added: start.duration_since(UNIX_EPOCH).unwrap().as_secs() as i32,
        reading_status: String::from("Plan to read"),
        language,
        description,
        identifier,
        last_modified,
        published_date,
        publisher,
        page_progression_direction: doc.page_progression_direction,
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

#[tauri::command]
#[specta::specta]
pub fn update_book(book: models::Book) -> Result<(), String> {
    let mut conn: SqliteConnection = establish_connection();
    let res = diesel::update(schema::book::table.filter(schema::book::id.eq(book.id.clone())))
        .set(&book)
        .execute(&mut conn);

    match res {
        Ok(_) => return Ok(()),
        Err(_) => return Err(String::from("Cannot update book")),
    }
}

#[tauri::command]
#[specta::specta]
pub fn update_book_reading_status(id: String, reading_status: String) -> Result<(), String> {
    let mut conn: SqliteConnection = establish_connection();
    let res = diesel::update(schema::book::table.filter(schema::book::id.eq(id)))
        .set(schema::book::reading_status.eq(reading_status))
        .execute(&mut conn);

    match res {
        Ok(_) => return Ok(()),
        Err(_) => return Err(String::from("Cannot update book")),
    }
}

#[tauri::command]
#[specta::specta]
pub fn remove_book(id: String) -> Result<(), String> {
    let mut conn: SqliteConnection = establish_connection();
    let res = conn.transaction(|conn| {
        diesel::delete(
            schema::book_collection_link::table
                .filter(schema::book_collection_link::book_id.eq(&id)),
        )
        .execute(conn)?;
        diesel::delete(
            schema::book_author_link::table.filter(schema::book_author_link::book_id.eq(&id)),
        )
        .execute(conn)?;
        diesel::delete(schema::bookmark::table.filter(schema::bookmark::book_id.eq(&id)))
            .execute(conn)?;
        diesel::delete(schema::highlight::table.filter(schema::highlight::book_id.eq(&id)))
            .execute(conn)?;
        diesel::delete(schema::book_settings::table.filter(schema::book_settings::book_id.eq(&id)))
            .execute(conn)?;
        diesel::delete(schema::book::table.filter(schema::book::id.eq(&id))).execute(conn)?;

        diesel::result::QueryResult::Ok(())
    });

    match res {
        Ok(_) => {}
        Err(_) => return Err(String::from("Cannot delete book")),
    }

    let cover_path = Path::new("mikomi-data/covers").join(&id);
    let res = fs::remove_file(cover_path);

    match res {
        Ok(_) => return Ok(()),
        Err(_) => return Err(String::from("Cannot delete book")),
    }
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
