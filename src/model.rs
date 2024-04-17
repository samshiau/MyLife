use diesel::Queryable;
use diesel::Insertable;
use crate::schema::accounts;

#[derive(Queryable)]
pub struct Account {
    pub id: i32, // Assuming the ID is an integer. Adjust the type if necessary.
    pub username: String,
    pub password_hash: String,
    pub account_type: String,
}

#[derive(Insertable)]
#[table_name="accounts"]
pub struct NewAccount<'a> {
    pub username: &'a str,
    pub password_hash: &'a str,
    pub account_type: &'a str,
}




