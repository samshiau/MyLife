use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use diesel::r2d2::{self, ConnectionManager};
use diesel::PgConnection;
use std::env;

async fn index() -> impl Responder {
    "Hello, world!"
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
            .data(pool.clone())
            .route("/", web::get().to(index))
            // Add more routes here
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
