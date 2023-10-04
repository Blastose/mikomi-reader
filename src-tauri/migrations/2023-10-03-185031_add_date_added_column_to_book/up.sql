-- Your SQL goes here
ALTER TABLE book
ADD COLUMN date_added INTEGER NOT NULL DEFAULT 0;

UPDATE book
SET date_added = unixepoch();