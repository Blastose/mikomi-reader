use crate::models;
use crate::schema;
use diesel::prelude::*;
use diesel::{Connection, SqliteConnection};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use std::error::Error;
use uuid::Uuid;

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

pub fn establish_connection() -> SqliteConnection {
    let database_url = "db.sqlite";

    SqliteConnection::establish(&database_url)
        .expect(&format!("Error connecting to {}", database_url))
}

pub fn run_migrations(
    conn: &mut SqliteConnection,
) -> Result<(), Box<dyn Error + Send + Sync + 'static>> {
    conn.run_pending_migrations(MIGRATIONS)?;

    Ok(())
}

#[tauri::command]
#[specta::specta]
pub fn get_books() -> Vec<models::Book> {
    let mut conn: SqliteConnection = establish_connection();
    let books = schema::book::table
        .select(models::Book::as_select())
        .load(&mut conn)
        .unwrap_or(vec![]);

    books
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
