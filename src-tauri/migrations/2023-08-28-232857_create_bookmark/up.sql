-- Your SQL goes here
CREATE TABLE bookmark (
    id TEXT PRIMARY KEY NOT NULL,
    book_id TEXT NOT NULL,
    display_text TEXT NOT NULL,
    date_added INTEGER NOT NULL,
    css_selector TEXT NOT NULL,
    FOREIGN KEY (book_id) REFERENCES book(id)
)