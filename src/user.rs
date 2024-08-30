/// This module contains the route handlers for the user-related routes

use actix_web::{web, HttpResponse, Responder};
use bcrypt::{hash, verify, DEFAULT_COST};  //password hashing library, the cost set a limit for the hashing for performance
use serde::Deserialize;
use diesel::insert_into;
use diesel::result::Error;
use serde::Serialize;
use diesel::RunQueryDsl;
use crate::model::{NewAccount,Account,NewProfile,ShowProfile};
use crate::schema;
use crate::DbPool;
use crate::PgConnection;




/// Retrieve a user profile from the database
/// Arguments: conn: &mut PgConnection, acc_id: i32
/// Returns: Result<ShowProfile, Error>
pub fn get_user_profile(conn: &mut PgConnection, acc_id: i32) -> Result<ShowProfile, Error> {
    use schema::userprofiles::dsl::*;
    use diesel::prelude::*;

    let result = userprofiles
            .filter(account_id.eq(acc_id)) // Ensure the field name matches your schema
            .first::<ShowProfile>(conn); // Fetch the first result that matches the query

    match result {
        Ok(profile_data) => Ok(profile_data),
        Err(e) => {
            eprintln!("Error retrieving profile: {:?}", e);
            Err(e)
        }
    }

}



#[derive(Deserialize)]
pub struct CreateAccountInfo {
    username: String,
    password: String,
    account_type: String,
}
/// Create a new account in the database
/// Arguments: pool: web::Data<DbPool>, form: web::Json<CreateAccountInfo>
/// Returns: impl Responder
/// Side note: deserialize is used to convert the json data to the struct data
pub async fn create_account(pool: web::Data<DbPool>, form: web::Json<CreateAccountInfo>) -> impl Responder { // ther reason to pass them is that we need to access the pool and the form data
    //logic for the create account route
    println!("Testing in create_account route");

    let new_user = form.into_inner();   //accessing the form data send from client, the data is in the form of CreateAccountInfo struct, automatically converted to json
    let hashed_password = match hash(&new_user.password, DEFAULT_COST) 
    { // hashing the password
        Ok(h) => h,
        Err(_) => return HttpResponse::InternalServerError().finish(),
    };

    let a_new_account: NewAccount = NewAccount 
    {  //creating a new account instance, the struct is from model.rs. Doing so will assign the values to the struct for communication with postgresql
        username: &new_user.username,
        password_hash: &hashed_password,
        account_type: &new_user.account_type
    };  // end of a_new_account struct

    let mut conn = match pool.get() 
    {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().finish(),
    };

    // Calling the insert_new_account function
    let (account_id, username) = 
    match insert_new_account(&mut conn, &a_new_account) 
    {
        Ok(tuple) => tuple,
        Err(_) => return HttpResponse::InternalServerError().finish(),
    };

    // Calling the insert_new_profile function using the returned account_id and username
    match insert_new_profile(&mut conn, account_id, &username) 
    {
        Ok(_) => {
            HttpResponse::Created() // Use the CREATED status code
                .json(format!("Account and profile created with Account ID: {}", account_id)) // Include the account ID in the response
        },
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}


/// Insert a new account into the database
/// Arguments: conn: &mut PgConnection, new_account: &NewAccount
/// Returns: Result<(i32, String), Error>
fn insert_new_account(conn: &mut PgConnection, new_account: &NewAccount,) -> Result<(i32,String), Error> {
    use schema::accounts::dsl::*; 

    insert_into(accounts)
        .values(new_account)
        .returning((id, username)) // Get the ID of the inserted record
        .get_result::<(i32, String)>(conn) // Get the result, expecting an ID
}




/// Insert(create) a new profile into the database
/// Arguments: conn: &mut PgConnection, accountid: i32, username: &str
/// Returns: Result<(), Error>
fn insert_new_profile(conn: &mut PgConnection, accountid: i32, username: &str,) -> Result<(), Error> {
    use schema::userprofiles::dsl::*;

    let new_profile = NewProfile 
    {
        account_id: accountid,
        user_name: username,
    };

    insert_into(userprofiles)
        .values(&new_profile)
        .execute(conn) // Execute the insert
        .map(|_| ()) // Return a unit value on success
}





#[derive(Deserialize)]
pub struct UpdateContentInfo {
    account_id: i32,
    field: String,
    value: UpdateValue, 
}
#[derive(Deserialize, Debug)]
#[serde(untagged)] 
pub enum UpdateValue {
    String(String),
    Int(i32),
}
/// Change the data in the database according to the field and value
/// Arguments: pool: web::Data<DbPool>, form: web::Json<UpdateContentInfo>
/// Returns: impl Responder
pub async fn change_db_data(pool: web::Data<DbPool>, form: web::Json<UpdateContentInfo>) -> impl Responder {
    println!("Testing in change_db_data route");
    use diesel::prelude::*;
    use schema::userprofiles::dsl::*;
    let content= form.into_inner();
   
    let accountid = content.account_id;
    let field = content.field;
    let value = content.value;

    println!(
        "Updating account {}: field '{}', value '{:?}'",
        accountid, field, value
    );

    let mut conn = match pool.get() {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().finish(),
    };

    let update_result = match value 
    {
        UpdateValue::Int(v) => 
        {
            match field.as_str() 
            {
                "age" => diesel::update(userprofiles.filter(account_id.eq(accountid)))
                    .set(schema::userprofiles::age.eq(v)).execute(&mut conn),
                "selfscore" => diesel::update(userprofiles.filter(account_id.eq(accountid)))
                    .set(schema::userprofiles::selfscore.eq(v)).execute(&mut conn),
                "selfscorepeople" => diesel::update(userprofiles.filter(account_id.eq(accountid)))
                    .set(schema::userprofiles::selfscorepeople.eq(v)).execute(&mut conn),
                // Add more fields as required
                _ => Err(diesel::result::Error::NotFound),
            }
        }
        UpdateValue::String(v) => 
        {
            match field.as_str() 
            {
                "mbti" => diesel::update(userprofiles.filter(account_id.eq(accountid)))
                    .set(schema::userprofiles::mbti.eq(v)).execute(&mut conn),
                "occupation" => diesel::update(userprofiles.filter(account_id.eq(accountid)))
                    .set(schema::userprofiles::occupation.eq(v)).execute(&mut conn),
                "education_level" => diesel::update(userprofiles.filter(account_id.eq(accountid)))
                    .set(schema::userprofiles::education_level.eq(v)).execute(&mut conn),
                "attachment_style" => diesel::update(userprofiles.filter(account_id.eq(accountid)))
                    .set(schema::userprofiles::attachment_style.eq(v)).execute(&mut conn),
                "medical_history" => diesel::update(userprofiles.filter(account_id.eq(accountid)))
                    .set(schema::userprofiles::medical_history.eq(v)).execute(&mut conn),
                "gender" => diesel::update(userprofiles.filter(account_id.eq(accountid)))
                    .set(schema::userprofiles::gender.eq(v)).execute(&mut conn),
                "heritage_ethnicity" => diesel::update(userprofiles.filter(account_id.eq(accountid)))
                    .set(schema::userprofiles::heritage_ethnicity.eq(v)).execute(&mut conn),
                "sexual_preference" => diesel::update(userprofiles.filter(account_id.eq(accountid)))
                    .set(schema::userprofiles::sexual_preference.eq(v)).execute(&mut conn),
                _ => Err(diesel::result::Error::NotFound),
            }
        }
    };

    // Check result and return the appropriate response
    match update_result {
        Ok(_) => HttpResponse::Ok().json("Content updated successfully"),
        Err(diesel::result::Error::NotFound) => HttpResponse::BadRequest().body(format!("Invalid field: {}", field)),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }

}





#[derive(Deserialize)]
pub struct LoginInfo {
   usernamelogin: String,
   passwordlogin: String,
}
#[derive(Serialize)]
struct LoginResponse {
    message: String,
    account_id: i32,
}
/// Login action
/// Arguments: pool: web::Data<DbPool>, form: web::Json<LoginInfo>
/// Returns: impl Responder
pub async fn login(pool: web::Data<DbPool>, form: web::Json<LoginInfo>) -> impl Responder {
    use schema::accounts::dsl::*;
    use diesel::prelude::*;

    // into_inner() is used to convert the Json data to the struct data. it also remove the wrapper
    let login_info_form = form.into_inner();
    let mut conn = match pool.get() 
    {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().finish(),
    };

    let result = accounts.filter(username.eq(&login_info_form.usernamelogin))
        .first::<Account>(&mut conn);

    match result {
        Ok(account) => {
            // Verify the hashed password
            if verify(&login_info_form.passwordlogin, &account.password_hash).unwrap_or(false) {
                let response = LoginResponse {
                    message: "Login successful".to_string(),
                    account_id: account.id,
                };
                HttpResponse::Ok().json(response)

            } else {
                HttpResponse::Unauthorized().body("Invalid username or password")
            }
        },
        Err(_) => HttpResponse::Unauthorized().body("Invalid username or password"),

    }
}





#[derive(Deserialize)]
pub struct QueryInfo {
    acc_id: String,
}
/// Obtain user profile and send back to the frontend to display
/// Arguments: pool: web::Data<DbPool>, info: web::Query<QueryInfo>
/// Returns: impl Responder
/// FIXME: Need to reuse the get_user_profile function
pub async fn obtain_user_profile(pool: web::Data<DbPool>, info: web::Query<QueryInfo>) -> impl Responder {
    use schema::userprofiles::dsl::*;
    use diesel::prelude::*;

    // Extract account ID and convert to integer
    let acc_id: i32 = match info.acc_id.parse() {  
         Ok(id) => id,
         Err(_) => return HttpResponse::BadRequest().finish(), 
    };

    // Get a connection from the pool
    let mut conn = match pool.get() {  
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().finish(),
    };


    //FIXME: Need to reuse the get_user_profile function
    let profile_result = userprofiles
        .filter(account_id.eq(acc_id)) // Ensure the field name matches your schema
        .first::<ShowProfile>(&mut conn); // Fetch the first result that matches the query


    match profile_result {
        Ok(profile_data) => {
            HttpResponse::Ok().json(profile_data) // Send the profile data as a JSON response
        },
        Err(diesel::result::Error::NotFound) => {
            HttpResponse::NotFound().json("Profile not found") // Send a not found response if no profile matches
        },
        Err(_) => {
            HttpResponse::InternalServerError().finish() // Send a 500 response for any other error
        }
    }
}