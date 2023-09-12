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

diesel::table! {
    bookmark (id) {
        id -> Text,
        book_id -> Text,
        display_text -> Text,
        date_added -> Integer,
        css_selector -> Text,
    }
}

diesel::table! {
    highlight (id) {
        id -> Text,
        book_id -> Text,
        date_added -> Integer,
        note -> Text,
        start_container -> Text,
        start_offset -> Integer,
        end_container -> Text,
        end_offset -> Integer,
        color -> Text,
    }
}

diesel::joinable!(book_author_link -> author (author_id));
diesel::joinable!(book_author_link -> book (book_id));
diesel::joinable!(bookmark -> book (book_id));
diesel::joinable!(highlight -> book (book_id));

diesel::allow_tables_to_appear_in_same_query!(
    author,
    book,
    book_author_link,
    bookmark,
    highlight,
);
