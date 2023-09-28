-- Your SQL goes here
CREATE TABLE book_settings (
    id TEXT PRIMARY KEY NOT NULL,
    book_id TEXT NOT NULL UNIQUE,
    width INTEGER,
    height INTEGER,
    percentage INTEGER,
    last_element TEXT,
    font_size INTEGER DEFAULT 16 NOT NULL,
    line_height TEXT DEFAULT 'normal' NOT NULL,
    margins INTEGER DEFAULT 0 NOT NULL,
    text_align TEXT DEFAULT 'initial' NOT NULL,
    column_count INTEGER DEFAULT 1 NOT NULL,
    writing_mode TEXT NOT NULL,
    font_family TEXT DEFAULT 'initial' NOT NULL,
    background_color TEXT NOT NULL,
    color TEXT NOT NULL,
    link_color TEXT NOT NULL,
    primary_color TEXT NOT NULL,
    image_blend_mode TEXT NOT NULL,
    FOREIGN KEY (book_id) REFERENCES book(id)
);

CREATE TABLE reader_theme (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    background_color TEXT NOT NULL,
    color TEXT NOT NULL,
    link_color TEXT NOT NULL,
    image_blend_mode TEXT NOT NULL,
    primary_color TEXT NOT NULL
);