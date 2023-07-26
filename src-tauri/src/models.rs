use diesel::prelude::*;
use serde::Serialize;
use specta::Type;

#[derive(Queryable, Selectable, Insertable, Serialize, Type, PartialEq, Debug)]
#[diesel(table_name = crate::schema::book)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Book {
    pub id: String,
    pub title: String,
    pub path: String,
}

#[derive(Queryable, Selectable, Insertable, Serialize, Type, PartialEq, Debug)]
#[diesel(table_name = crate::schema::author)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Author {
    pub id: String,
    pub name: String,
}

#[derive(Queryable, Selectable, Insertable, Serialize, Type, PartialEq, Debug)]
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
