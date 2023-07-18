use diesel::prelude::*;

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::book)]
pub struct Book {
    pub id: String,
    pub title: String,
    pub path: String,
}
