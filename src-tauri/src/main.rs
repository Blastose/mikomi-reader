// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use specta::collect_types;
use tauri_specta::ts;

mod db;
pub mod models;
pub mod schema;

fn main() {
    #[cfg(debug_assertions)]
    ts::export(
        collect_types![
            db::get_books,
            db::get_books_base64,
            db::add_book,
            db::add_book_from_file,
            db::add_multiple_books_from_files
        ],
        "../src/lib/bindings.ts",
    )
    .unwrap();

    let mut conn = db::establish_connection();
    db::run_migrations(&mut conn).expect("Unable to run migrations");

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            db::get_books,
            db::get_books_base64,
            db::add_book,
            db::add_book_from_file,
            db::add_multiple_books_from_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
