use diesel::prelude::*;
use serde::Serialize;

#[derive(Queryable, Selectable, Insertable, Serialize)]
#[diesel(table_name = crate::schema::book)]
pub struct Book {
    pub id: String,
    pub title: String,
    pub path: String,
}
