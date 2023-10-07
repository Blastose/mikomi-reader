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
            db::get_book,
            db::get_books,
            db::add_book_from_file,
            db::add_multiple_books_from_files,
            db::update_book,
            db::add_bookmark,
            db::remove_bookmark,
            db::update_bookmark,
            db::add_highlight,
            db::remove_highlight,
            db::update_highlight,
            db::add_book_settings,
            db::remove_book_settings,
            db::update_book_settings,
            db::get_reader_themes,
            db::add_reader_theme,
            db::remove_reader_theme,
            db::update_reader_theme,
            db::get_collections,
            db::add_collection,
            db::update_collection_name,
            db::remove_collection,
            db::add_book_to_collection,
            db::add_book_to_collections,
            db::remove_book_from_collection,
        ],
        "../src/lib/bindings.ts",
    )
    .unwrap();

    let mut conn = db::establish_connection();
    db::run_migrations(&mut conn).expect("Unable to run migrations");

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            db::get_book,
            db::get_books,
            db::add_book_from_file,
            db::add_multiple_books_from_files,
            db::update_book,
            db::add_bookmark,
            db::remove_bookmark,
            db::update_bookmark,
            db::add_highlight,
            db::remove_highlight,
            db::update_highlight,
            db::add_book_settings,
            db::remove_book_settings,
            db::update_book_settings,
            db::get_reader_themes,
            db::add_reader_theme,
            db::remove_reader_theme,
            db::update_reader_theme,
            db::get_collections,
            db::add_collection,
            db::update_collection_name,
            db::remove_collection,
            db::add_book_to_collection,
            db::add_book_to_collections,
            db::remove_book_from_collection,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
