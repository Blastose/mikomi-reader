-- Your SQL goes here
CREATE TABLE language (name TEXT PRIMARY KEY NOT NULL);

ALTER TABLE book
ADD COLUMN language TEXT REFERENCES language(name);

ALTER TABLE book
ADD COLUMN last_modified TEXT;

ALTER TABLE book
ADD COLUMN identifier TEXT;

ALTER TABLE book
ADD COLUMN published_date TEXT;

ALTER TABLE book
ADD COLUMN description TEXT;

ALTER TABLE book
ADD COLUMN publisher TEXT;

ALTER TABLE book
ADD COLUMN page_progression_direction TEXT DEFAULT 'ltr';