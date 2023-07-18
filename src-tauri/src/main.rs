// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
pub mod models;
pub mod schema;

fn main() {
    let mut conn = db::establish_connection();
    db::run_migrations(&mut conn).expect("Unable to run migrations");

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![db::get_books, db::add_book])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
