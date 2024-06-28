extern crate diesel;
use actix_web::dev::RequestHead;
use actix_web::{web, App, HttpResponse, HttpServer, Responder, http::header, middleware};
use diesel::r2d2::{self, ConnectionManager};
use diesel::PgConnection;
use bcrypt::{hash, verify, DEFAULT_COST};  //password hashing library, the cost set a limit for the hashing for performance
use serde::Deserialize;
use diesel::RunQueryDsl;
use actix_cors::Cors;
use diesel::insert_into;
mod model; 
mod schema;
use model::{NewAccount,Account,NewProfile,ShowProfile};
extern crate dotenv;
use dotenv::dotenv;
use diesel::result::Error;
use serde::Serialize;
use std::panic;
use async_openai::{types::CreateCompletionRequestArgs, Client, config::OpenAIConfig};
//use async_openai::{Client, types::{CreateChatCompletionRequest, ChatCompletionMessage}, config::OpenAIConfig};

//use std::error::Error;
//use futures::StreamExt;


type DbPool = r2d2::Pool<ConnectionManager<PgConnection>>;


#[derive(Deserialize)]
pub struct CreateAccountInfo {
    username: String,
    password: String,
    account_type: String,
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

#[derive(Deserialize)]
pub struct QueryInfo {
    acc_id: String,
}

#[derive(Deserialize, Debug)]
#[serde(untagged)] 
pub enum UpdateValue {
    String(String),
    Int(i32),
}

#[derive(Deserialize)]
pub struct UpdateContentInfo {
    account_id: i32,
    field: String,
    value: UpdateValue,
     
}

#[derive(Deserialize)]
    pub struct ChatMessage {
        message: String,
        query_account_id: i32,
    }

fn get_user_profile(conn: &mut PgConnection, acc_id: i32) -> Result<ShowProfile, Error> {
    use schema::userprofiles::dsl::*;
    use diesel::prelude::*;

    println!("Testing in obtain_user_profile function..... using account id {}",acc_id);

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


fn insert_new_account(conn: &mut PgConnection, new_account: &NewAccount,) -> Result<(i32,String), Error> {
    use schema::accounts::dsl::*; 

    insert_into(accounts)
        .values(new_account)
        .returning((id, username)) // Get the ID of the inserted record
        .get_result::<(i32, String)>(conn) // Get the result, expecting an ID
}

// Insert a new profile using the account_id
fn insert_new_profile(conn: &mut PgConnection, accountid: i32, username: &str,) -> Result<(), Error> {
    use schema::userprofiles::dsl::*;

    let new_profile = NewProfile {
        account_id: accountid,
        user_name: username,
    };

    insert_into(userprofiles)
        .values(&new_profile)
        .execute(conn) // Execute the insert
        .map(|_| ()) // Return a unit value on success
}

async fn create_account(pool: web::Data<DbPool>, form: web::Json<CreateAccountInfo>) -> impl Responder { // ther reason to pass them is that we need to access the pool and the form data
    //logic for the create account route
    println!("Testing in create_account route");

    //use schema::accounts::dsl::*; 
    let new_user = form.into_inner();   //accessing the form data send from client, the data is in the form of CreateAccountInfo struct, automatically converted to json
    let hashed_password = match hash(&new_user.password, DEFAULT_COST) { // hashing the password
        Ok(h) => h,
        Err(_) => return HttpResponse::InternalServerError().finish(),
    };
    let a_new_account: NewAccount = NewAccount {  //creating a new account instance, the struct is from model.rs. Doing so will assign the values to the struct for communication with postgresql
        username: &new_user.username,
        password_hash: &hashed_password,
        account_type: &new_user.account_type};  // end of a_new_account struct

    let mut conn = match pool.get() {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().finish(),
    };

    let (account_id, username) = match insert_new_account(&mut conn, &a_new_account) {
        Ok(tuple) => tuple,
        Err(_) => return HttpResponse::InternalServerError().finish(),
    };

    // Insert a new profile using the retrieved account_id
    match insert_new_profile(&mut conn, account_id, &username) {
        Ok(_) => {
            HttpResponse::Created() // Use the CREATED status code
                .json(format!("Account and profile created with Account ID: {}", account_id)) // Include the account ID in the response
        },
        Err(_) => HttpResponse::InternalServerError().finish(),
    }

    // match insert_into(accounts)
    //     .values(&a_new_account)
    //     .execute(&mut conn) // Pass a mutable reference to the connection
    // {
    //     Ok(_) => HttpResponse::new(StatusCode::CREATED),
    //     Err(_) => HttpResponse::InternalServerError().finish(),
    // }

}

async fn change_db_data(pool: web::Data<DbPool>, form: web::Json<UpdateContentInfo>) -> impl Responder {
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
                // Add more fields as required
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


async fn login(pool: web::Data<DbPool>, form: web::Json<LoginInfo>) -> impl Responder {
    println!("Testing in login route");
    use schema::accounts::dsl::*;
    use diesel::prelude::*;

    let login_info_form = form.into_inner();
    let mut conn = match pool.get() {
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().finish(),
    };
    println!("connection was ok");
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

async fn logout() -> impl Responder {
    "Logout"
}

fn create_database_pool() -> Result<DbPool, String> {  // this function setup a db connection pool
    println!("Starting to create database pool...");

    let database_url = std::env::var("DATABASE_URL")
        .map_err(|_| "DATABASE_URL must be set".to_string())?;
    println!("Database URL: {}", database_url);

    let manager = ConnectionManager::<PgConnection>::new(database_url);
    println!("Connection manager created.");

    let pool_result = panic::catch_unwind(|| {
        r2d2::Pool::builder().build(manager)
    });

    match pool_result {
        Ok(Ok(pool)) => {
            println!("Connection pool created successfully.");
            Ok(pool)
        }
        Ok(Err(e)) => {
            println!("Failed to create pool: {:?}", e);

           // if let Some(source) = e.source() {
            //    println!("Caused by: {:?}", source);
          //  }

            Err(format!("Failed to create pool: {:?}", e))
        }
        Err(panic_info) => {
            println!("A panic occurred while creating the pool: {:?}", panic_info);
            Err("A panic occurred while creating the pool".to_string())
        }
    }
}

async fn obtain_user_profile(pool: web::Data<DbPool>, info: web::Query<QueryInfo>) -> impl Responder {
    use schema::userprofiles::dsl::*;
    use diesel::prelude::*;

   // println!("Testing in obtain_user_profile route");
    
     let acc_id: i32 = match info.acc_id.parse() {  // since the acc_id is a string, we need to convert it to an integer
         Ok(id) => id,
         Err(_) => return HttpResponse::BadRequest().finish(), // Handle the error appropriately
     };

    // println!("Datatype conversion was ok, The account id is: {}", acc_id); 

    let mut conn = match pool.get() {  // need to be mut since it might need to midufy its internial state in the future, so making it mut aoivd future need for changing the code
        Ok(conn) => conn,
        Err(_) => return HttpResponse::InternalServerError().finish(),
    };

   // println!("db connection was ok");


    let profile_result = userprofiles
        .filter(account_id.eq(acc_id)) // Ensure the field name matches your schema
        .first::<ShowProfile>(&mut conn); // Fetch the first result that matches the query

    //println!("waiting for result");

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

async fn openai_api_request(pool: web::Data<DbPool>,form: web::Json<ChatMessage>) -> Result<HttpResponse, actix_web::Error> {
    println!("inside openai request function");
    let request_message_body = form.into_inner();
    println!("after getting the message body");
    let api_key = std::env::var("OPENAI_API_KEY").map_err(|_| actix_web::error::ErrorInternalServerError("API key not set"))?;
    println!("after getting the api key");
    let config = OpenAIConfig::new().with_api_key(api_key);
    println!("after getting the config");
    let client = Client::with_config(config);
    println!("after getting the client");
    // Retrieve data according to the user
    println!("setting up db connection");
    let mut conn = pool.get().map_err(|_| actix_web::error::ErrorInternalServerError("Failed to get DB connection"))?;
    println!("getting user profile");
    let user_profile_result = get_user_profile(&mut conn, request_message_body.query_account_id).map_err(|_| actix_web::error::ErrorInternalServerError("Failed to retrieve user profile"))?;
    
    println!("formatting prompt");
    // Use the retrieved profile data (for demonstration purposes, let's assume we need user_profile.user_name)
    let prompt: String = format! (
    "This info is from an application that record user mental info and a chat message the will query about the user profile: 
    Message query {:?} - 
    User info: age {:?}, 
    occupation: {:?}, 
    education level:{:?}, 
    how the person rate him/her self: {:?}, 
    how the person think people rate him/her self {:?}, 
    mbti: {:?}, 
    attachment style: {:?}, 
    medical history {:?}, 
    gender: {:?},
    ethinicity: {:?}.
    Please answer the question in the message according to the user info", 
    request_message_body.message,
    user_profile_result.age,
    user_profile_result.occupation,
    user_profile_result.education_level,
    user_profile_result.selfscore,
    user_profile_result.selfscorepeople,
    user_profile_result.mbti,
    user_profile_result.attachment_style,
    user_profile_result.medical_history,
    user_profile_result.gender,
    user_profile_result.heritage_ethnicity);

    println!("after formatting prompt");

    let request = CreateCompletionRequestArgs::default()
        .model("gpt-3.5-turbo-instruct")
        .n(1)
        .prompt(prompt)  // Use the message from the form
        .max_tokens(1024_u16)
        .build()
        .map_err(|e| {
            eprintln!("Error building request: {}", e);
            actix_web::error::ErrorInternalServerError("Error building request")
        })?;

    println!("sending request");

    // Send the request to the OpenAI API
    let response = client.completions().create(request).await.map_err(|e| {
        eprintln!("Error sending request: {}", e);
        actix_web::error::ErrorInternalServerError("Error sending request")
    })?;

    // Process the response
    if let Some(choice) = response.choices.first() {
        let reply_text = &choice.text;
        Ok(HttpResponse::Ok().body(reply_text.clone()))
    } else {
        Ok(HttpResponse::InternalServerError().body("No response from OpenAI API"))
    }
}

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
    //println!("Testing1");
    dotenv().ok();  // loading the .env file
    //println!("Testing2");

    let pool = match create_database_pool() {
        Ok(pool) => pool,
        Err(e) => {
            eprintln!("{}", e);
            return Err(std::io::Error::new(std::io::ErrorKind::Other, e));
        },
    };

    println!("*************DB pool created successfully**************");
    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:3000") // Your frontend's address
            .allowed_origin("http://192.168.1.147:3000")
            .allowed_methods(vec!["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"]) // Allowed HTTP methods
            .allowed_headers(vec![header::AUTHORIZATION, header::ACCEPT])
            .allowed_header(header::CONTENT_TYPE)
            .max_age(3600);

        App::new()
            .wrap(middleware::Logger::default()) // Log all requests
            .wrap(cors) // Apply CORS middleware
            .app_data(web::Data::new(pool.clone()))  //doing so making the pool available to all the routes
            .route("/create_account", web::post().to(create_account))   // the post in here means it will only response to post request(post meaning chaing data in the server)
            .route("/login", web::post().to(login))
            .route("/logout", web::get().to(logout))
            .route("/obtain_user_profile", web::get().to(obtain_user_profile))
            .route("/change_db_data", web::patch().to(change_db_data))
            .route("/openai_api_request", web::post().to(openai_api_request))
            // Add more routes here
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
