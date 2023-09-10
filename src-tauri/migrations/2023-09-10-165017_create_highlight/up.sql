-- Your SQL goes here
CREATE TABLE highlight (
    id TEXT PRIMARY KEY NOT NULL,
    book_id TEXT NOT NULL,
    date_added INTEGER NOT NULL,
    note TEXT NOT NULL,
    start_container TEXT NOT NULL,
    start_offset INTEGER NOT NULL,
    end_container TEXT NOT NULL,
    end_offset INTEGER NOT NULL,
    color TEXT NOT NULL,
    FOREIGN KEY (book_id) REFERENCES book(id)
)