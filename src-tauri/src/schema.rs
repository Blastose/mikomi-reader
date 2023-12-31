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
        last_read -> Nullable<Integer>,
        date_added -> Integer,
        reading_status -> Text,
        language -> Nullable<Text>,
        last_modified -> Nullable<Text>,
        identifier -> Nullable<Text>,
        published_date -> Nullable<Text>,
        description -> Nullable<Text>,
        publisher -> Nullable<Text>,
        page_progression_direction -> Nullable<Text>,
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
    book_collection_link (book_id, collection_id) {
        book_id -> Text,
        collection_id -> Text,
        sort_order -> Nullable<Integer>,
    }
}

diesel::table! {
    book_settings (id) {
        id -> Text,
        book_id -> Text,
        width -> Nullable<Integer>,
        height -> Nullable<Integer>,
        percentage -> Nullable<Integer>,
        last_element -> Nullable<Text>,
        font_size -> Integer,
        line_height -> Text,
        margins -> Integer,
        text_align -> Text,
        column_count -> Integer,
        writing_mode -> Text,
        font_family -> Text,
        background_color -> Text,
        color -> Text,
        link_color -> Text,
        primary_color -> Text,
        image_blend_mode -> Text,
        last_page -> Nullable<Integer>,
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
    collection (id) {
        id -> Text,
        name -> Text,
        sort_order -> Nullable<Integer>,
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

diesel::table! {
    language (name) {
        name -> Text,
    }
}

diesel::table! {
    reader_theme (id) {
        id -> Text,
        name -> Text,
        background_color -> Text,
        color -> Text,
        link_color -> Text,
        image_blend_mode -> Text,
        primary_color -> Text,
    }
}

diesel::joinable!(book -> language (language));
diesel::joinable!(book_author_link -> author (author_id));
diesel::joinable!(book_author_link -> book (book_id));
diesel::joinable!(book_collection_link -> book (book_id));
diesel::joinable!(book_collection_link -> collection (collection_id));
diesel::joinable!(book_settings -> book (book_id));
diesel::joinable!(bookmark -> book (book_id));
diesel::joinable!(highlight -> book (book_id));

diesel::allow_tables_to_appear_in_same_query!(
    author,
    book,
    book_author_link,
    book_collection_link,
    book_settings,
    bookmark,
    collection,
    highlight,
    language,
    reader_theme,
);
