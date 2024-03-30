-- Your SQL goes here
CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  hashed_password TEXT NOT NULL,
  account_type VARCHAR NOT NULL CHECK (account_type IN ('regular', 'therapist')),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc')
);