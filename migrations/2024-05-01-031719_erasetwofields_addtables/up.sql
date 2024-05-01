-- Your SQL goes here
CREATE TABLE journal (
    journal_id SERIAL PRIMARY KEY,
    account_id INT NOT NULL,
    date_time VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    text TEXT NOT NULL
);

ALTER TABLE userprofiles DROP COLUMN IF EXISTS people;
ALTER TABLE userprofiles DROP COLUMN IF EXISTS journel;

ALTER TABLE peopleinmylife ADD COLUMN IF NOT EXISTS account_id INT;