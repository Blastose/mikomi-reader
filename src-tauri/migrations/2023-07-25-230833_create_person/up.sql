-- Your SQL goes here
CREATE TABLE author (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE book_author_link (
    book_id TEXT NOT NULL,
    author_id TEXT NOT NULL,
    primary_creator BOOLEAN NOT NULL,
    FOREIGN KEY (book_id) REFERENCES book(id),
    FOREIGN KEY (author_id) REFERENCES author(id),
    PRIMARY KEY (book_id, author_id)
)