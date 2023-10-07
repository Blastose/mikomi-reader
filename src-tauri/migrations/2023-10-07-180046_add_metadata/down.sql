-- This file should undo anything in `up.sql`
ALTER TABLE book DROP COLUMN page_progression_direction;

ALTER TABLE book DROP COLUMN publisher;

ALTER TABLE book DROP COLUMN description;

ALTER TABLE book DROP COLUMN published_date;

ALTER TABLE book DROP COLUMN identifier;

ALTER TABLE book DROP COLUMN last_modified;

ALTER TABLE book DROP COLUMN language;

DROP TABLE language;