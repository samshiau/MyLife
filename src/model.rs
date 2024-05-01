use diesel::Queryable;
use diesel::Insertable;
use serde::{Serialize, Deserialize};
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

#[derive(Debug, Queryable, Serialize, Deserialize)]
pub struct ShowProfile {
    profile_id: i32,            // Serial primary key
    account_id: Option<i32>,            // Reference to accounts table,
    user_name: Option<String>,          // User name, up to 50 characters
    age: Option<i32>,           // User's age
    occupation: Option<String>, // Occupation, up to 50 characters
    education_level: Option<String>, // Education level, up to 50 characters
    selfscore: Option<i32>,     // Self-assessment score
    selfscorepeople: Option<i32>, // Score based on people in the user's life
    mbti: Option<String>,       // Myers-Briggs type, usually 4 characters
    attachment_style: Option<String>, // Attachment style, up to 20 characters
    medical_history: Option<String>,  // Medical history text
    gender: Option<String>,     // Gender, up to 20 characters
    heritage_ethnicity: Option<String>, // Heritage or ethnicity, up to 50 characters
    sexual_preference: Option<String>, // Sexual preference, up to 20 characters
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

