use diesel::prelude::*;
use diesel::table;

#[derive(Queryable)]
pub struct Account {
    pub id: i32,
    pub username: String,
    pub password_hash: String,
    pub account_type: String,
}

table! {
    accounts (id) {
        id -> Int4,
        username -> Varchar,
        password_hash -> Varchar,
        account_type -> Varchar,
    }
}
