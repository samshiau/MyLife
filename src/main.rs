extern crate diesel;
use actix_web::{web, App, HttpResponse, HttpServer, Responder, http::StatusCode};
use diesel::r2d2::{self, ConnectionManager};
use diesel::PgConnection;
use bcrypt::{hash, DEFAULT_COST};  //password hashing library, the cost set a limit for the hashing for performance
use serde::Deserialize;
use diesel::RunQueryDsl;
use diesel::insert_into;
mod model; 
mod schema;
type DbPool = r2d2::Pool<ConnectionManager<PgConnection>>;
use model::NewAccount;

#[derive(Deserialize)]
pub struct CreateAccountInfo {
    username: String,
    password: String,
    account_type: String,
}

#[derive(Deserialize)]
pub struct LoginInfo {
   // username: String,
   // password: String,
}



async fn create_account(pool: web::Data<DbPool>, form: web::Json<CreateAccountInfo>) -> impl Responder { // ther reason to pass them is that we need to access the pool and the form data
    //logic for the create account route
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

async fn login() -> impl Responder {
    "Login"
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

    let pool = create_database_pool();  // calling the function to create db pool

    HttpServer::new(move || {
        App::new()
            // Add the database pool to the application state
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
