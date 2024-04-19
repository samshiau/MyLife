extern crate diesel;
use actix_web::{web, App, HttpResponse, HttpServer, Responder, http::StatusCode, http::header, middleware};
use diesel::r2d2::{self, ConnectionManager};
use diesel::PgConnection;
use bcrypt::{hash, verify, DEFAULT_COST};  //password hashing library, the cost set a limit for the hashing for performance
use serde::Deserialize;
use diesel::RunQueryDsl;
use actix_cors::Cors;
use diesel::insert_into;
mod model; 
mod schema;
type DbPool = r2d2::Pool<ConnectionManager<PgConnection>>;
use model::{NewAccount,Account};
extern crate dotenv;
use dotenv::dotenv;
//use actix_web::http::StatusCode; // Add import for StatusCode

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



async fn create_account(pool: web::Data<DbPool>, form: web::Json<CreateAccountInfo>) -> impl Responder { // ther reason to pass them is that we need to access the pool and the form data
    //logic for the create account route
    println!("Testing in create_account route");

    use schema::accounts::dsl::*; 
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

    match insert_into(accounts)
        .values(&a_new_account)
        .execute(&mut conn) // Pass a mutable reference to the connection
    {
        Ok(_) => HttpResponse::new(StatusCode::CREATED),
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
    //println!("connection was ok");
    let result = accounts.filter(username.eq(&login_info_form.usernamelogin))
        .first::<Account>(&mut conn);
    match result {
        Ok(account) => {
            // Verify the hashed password
            if verify(&login_info_form.passwordlogin, &account.password_hash).unwrap_or(false) {
                HttpResponse::Ok().status(StatusCode::OK).body("Login successful") // Convert integer status code to StatusCode enum variant
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


fn create_database_pool() -> DbPool {  // this function setup a db connection pool
    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");  // accessing db url and using .expect() to handle error
    let manager = ConnectionManager::<PgConnection>::new(database_url);  // creat instance of connection manager using the type pgconnection since we are using postgresql
    r2d2::Pool::builder()  // calling builder method to build
        .build(manager)
        .expect("Failed to create pool.")
}


#[actix_rt::main]
async fn main() -> std::io::Result<()> {
    println!("Testing1");
    dotenv().ok();  // loading the .env file
    let pool = create_database_pool();  // calling the function to create db pool
    println!("Testing2");
    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:3000") // Your frontend's address
            .allowed_origin("http://192.168.1.147:3000")
            .allowed_methods(vec!["GET", "POST", "OPTIONS"]) // Allowed HTTP methods
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
            // Add more routes here
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
