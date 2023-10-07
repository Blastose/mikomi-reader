-- Your SQL goes here
CREATE TABLE collection (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE book_collection_link (
    book_id TEXT NOT NULL,
    collection_id TEXT NOT NULL,
    FOREIGN KEY (book_id) REFERENCES book(id),
    FOREIGN KEY (collection_id) REFERENCES collection(id),
    PRIMARY KEY (book_id, collection_id)
)