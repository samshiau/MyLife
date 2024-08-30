/// Main.rs contains:
/// 1. The main function that starts the server and map to the routes
/// 2. The create_database_pool function that creates a connection pool to the database
extern crate diesel;
extern crate dotenv;
use actix_web::{web, App, HttpServer, http::header, middleware};
use diesel::r2d2::{self, ConnectionManager};
use diesel::PgConnection;
use actix_cors::Cors;
use dotenv::dotenv;
use std::panic;
mod model; 
mod schema;
mod api;
mod user;

type DbPool = r2d2::Pool<ConnectionManager<PgConnection>>;

/// FIXME: This function is not working properly, sometimes will error out
/// Create a connection pool to the database
/// 
/// returns dp_pool: r2d2::Pool<ConnectionManager<PgConnection>>
fn create_database_pool() -> Result<DbPool, String> {  

    println!("Starting to create database pool...");

    let database_url = std::env::var("DATABASE_URL")
        .map_err(|_| "DATABASE_URL must be set".to_string())?;

    println!("Database URL: {}", database_url);

    let manager = ConnectionManager::<PgConnection>::new(database_url);

    println!("Connection manager created.");
    
    // Attpemt to create the pool, this is the line that cause program to stop.
    let pool_result = panic::catch_unwind(|| {
        r2d2::Pool::builder().build(manager)
    });

    //FIXME: Purpose of code is unclear
    match pool_result {
        Ok(Ok(pool)) => {
            println!("Connection pool created successfully.");
            Ok(pool)
        }
        Ok(Err(e)) => {
            println!("Failed to create pool: {:?}", e);

            Err(format!("Failed to create pool: {:?}", e))
        }
        Err(panic_info) => {
            println!("A panic occurred while creating the pool: {:?}", panic_info);
            Err("A panic occurred while creating the pool".to_string())
        }
    }
}


/// Main function that
/// 1. Creates a connection pool to the database
/// 2. Starts the server
/// 3. Maps the routes to the functions
#[actix_rt::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();  // loading the .env file for the environment variables

    let pool = match create_database_pool() {
        Ok(pool) => pool,
        Err(e) => {
            eprintln!("{}", e);
            return Err(std::io::Error::new(std::io::ErrorKind::Other, e));
        },
    };

    // Seeing this line means the pool was created successfully
    println!("****DB pool created successfully****");

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:3000") 
            .allowed_origin("http://192.168.1.147:3000")
            .allowed_methods(vec!["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"]) 
            .allowed_headers(vec![header::AUTHORIZATION, header::ACCEPT])  
            .allowed_header(header::CONTENT_TYPE) 
            .max_age(3600);

        App::new()
            .wrap(middleware::Logger::default()) // Log all requests
            .wrap(cors) // Apply CORS middleware
            .app_data(web::Data::new(pool.clone()))  //doing so making the pool available to all the routes
            .route("/create_account", web::post().to(user::create_account))   // the post in here means it will only response to post request(post meaning chaing data in the server)
            .route("/login", web::post().to(user::login))
            .route("/obtain_user_profile", web::get().to(user::obtain_user_profile))
            .route("/change_db_data", web::patch().to(user::change_db_data))
            .route("/openai_api_request", web::post().to(api::openai_api_request))
            // Add more routes here
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
