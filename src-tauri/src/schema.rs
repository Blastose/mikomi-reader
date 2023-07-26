// @generated automatically by Diesel CLI.

diesel::table! {
    author (id) {
        id -> Text,
        name -> Text,
    }
}

diesel::table! {
    book (id) {
        id -> Text,
        title -> Text,
        path -> Text,
    }
}

diesel::table! {
    book_author_link (book_id, author_id) {
        book_id -> Text,
        author_id -> Text,
        primary_creator -> Bool,
    }
}

diesel::joinable!(book_author_link -> author (author_id));
diesel::joinable!(book_author_link -> book (book_id));

diesel::allow_tables_to_appear_in_same_query!(
    author,
    book,
    book_author_link,
);
