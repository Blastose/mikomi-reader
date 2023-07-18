// @generated automatically by Diesel CLI.

diesel::table! {
    book (id) {
        id -> Text,
        title -> Text,
        path -> Text,
    }
}
