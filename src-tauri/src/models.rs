use diesel::prelude::*;
use serde::Serialize;
use specta::Type;

#[derive(Queryable, Selectable, Insertable, Serialize, Type)]
#[diesel(table_name = crate::schema::book)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Book {
    pub id: String,
    pub title: String,
    pub path: String,
}
