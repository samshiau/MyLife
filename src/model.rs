use diesel::Queryable;
use diesel::Insertable;
use crate::schema::accounts;
//use crate::schema::peopleinmylife;
use crate::schema::userprofiles;
#[derive(Queryable)]
pub struct Account {
    pub id: i32, // Assuming the ID is an integer. Adjust the type if necessary.
    pub username: String,
    pub password_hash: String,
    pub account_type: String,
}

#[derive(Insertable)]
#[diesel(table_name = accounts)]
pub struct NewAccount<'a> {
    pub username: &'a str,
    pub password_hash: &'a str,
    pub account_type: &'a str,
}


#[derive(Insertable)]
#[diesel(table_name = userprofiles)]
pub struct NewProfile<'a>{
    pub account_id: i32,
    pub user_name: &'a str,
}

