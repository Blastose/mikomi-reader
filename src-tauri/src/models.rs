use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(
    Queryable,
    Selectable,
    Insertable,
    Deserialize,
    Identifiable,
    QueryableByName,
    Serialize,
    Type,
    PartialEq,
    Debug,
    AsChangeset,
)]
#[diesel(table_name = crate::schema::book)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Book {
    pub id: String,
    pub title: String,
    pub path: String,
    pub last_read: Option<i32>,
}

#[derive(Queryable, Selectable, Insertable, Serialize, Identifiable, Type, PartialEq, Debug)]
#[diesel(table_name = crate::schema::author)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Author {
    pub id: String,
    pub name: String,
}

#[derive(
    Queryable,
    Selectable,
    Insertable,
    Deserialize,
    Serialize,
    Associations,
    Identifiable,
    Type,
    PartialEq,
    Debug,
)]
#[diesel(belongs_to(Book))]
#[diesel(table_name = crate::schema::bookmark)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Bookmark {
    pub id: String,
    pub book_id: String,
    pub display_text: String,
    pub date_added: i32,
    pub css_selector: String,
}

#[derive(
    Queryable,
    Selectable,
    Insertable,
    Deserialize,
    Serialize,
    Associations,
    Identifiable,
    Type,
    PartialEq,
    Debug,
    AsChangeset,
)]
#[diesel(belongs_to(Book))]
#[diesel(table_name = crate::schema::highlight)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Highlight {
    pub id: String,
    pub book_id: String,
    pub date_added: i32,
    pub note: String,
    pub start_container: String,
    pub start_offset: i32,
    pub end_container: String,
    pub end_offset: i32,
    pub color: String,
}

#[derive(
    Queryable,
    Selectable,
    Insertable,
    Deserialize,
    Serialize,
    Associations,
    Identifiable,
    Type,
    PartialEq,
    Debug,
    AsChangeset,
    Clone,
)]
#[diesel(belongs_to(Book))]
#[diesel(table_name = crate::schema::book_settings)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct BookSettings {
    pub id: String,
    pub book_id: String,
    pub width: Option<i32>,
    pub height: Option<i32>,
    pub percentage: Option<i32>,
    pub last_element: Option<String>,
    pub last_page: Option<i32>,
    pub font_size: i32,
    pub line_height: String,
    pub margins: i32,
    pub text_align: String,
    pub column_count: i32,
    pub writing_mode: String,
    pub font_family: String,
    pub background_color: String,
    pub color: String,
    pub link_color: String,
    pub primary_color: String,
    pub image_blend_mode: String,
}

#[derive(
    Queryable,
    Selectable,
    Insertable,
    Deserialize,
    Serialize,
    Identifiable,
    Type,
    PartialEq,
    Debug,
    AsChangeset,
)]
#[diesel(table_name = crate::schema::reader_theme)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct ReaderTheme {
    pub id: String,
    pub name: String,
    pub background_color: String,
    pub color: String,
    pub link_color: String,
    pub primary_color: String,
    pub image_blend_mode: String,
}

#[derive(
    Queryable, Selectable, Insertable, Serialize, Associations, Identifiable, Type, PartialEq, Debug,
)]
#[diesel(belongs_to(Book))]
#[diesel(belongs_to(Author))]
#[diesel(table_name = crate::schema::book_author_link)]
#[diesel(primary_key(book_id, author_id))]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct BookAuthorLink {
    pub book_id: String,
    pub author_id: String,
    pub primary_creator: bool,
}
