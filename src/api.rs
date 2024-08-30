/// This module contains the API handlers for interacting with the OpenAI API
extern crate diesel;
extern crate dotenv;
use crate::DbPool;
use crate::user;
use async_openai::{types::CreateCompletionRequestArgs, Client, config::OpenAIConfig};
use actix_web::{web, HttpResponse};
use serde::Deserialize;

#[derive(Deserialize)]
    pub struct ChatMessage {
        message: String,
        query_account_id: i32,
    }


/// Interact with the OpenAI API to generate a response to a user message
/// 
///  Arguments: Message, query_account_id(user account id)
///  Returns: HttpResponse
/// 
pub async fn openai_api_request(pool: web::Data<DbPool>,form: web::Json<ChatMessage>) -> Result<HttpResponse, actix_web::Error> {
    let request_message_body = form.into_inner();
    let api_key = std::env::var("OPENAI_API_KEY").map_err(|_| actix_web::error::ErrorInternalServerError("API key not set"))?;
    let config = OpenAIConfig::new().with_api_key(api_key);
    let client = Client::with_config(config);
    
    // Retrieve data according to the user id
    let mut conn = pool.get().map_err(|_| actix_web::error::ErrorInternalServerError("Failed to get DB connection"))?;
    let user_profile_result = 
        user::get_user_profile(&mut conn, request_message_body.query_account_id)
        .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to retrieve user profile"))?;
    
    // Use the retrieved profile data to build the prompt
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
        user_profile_result.heritage_ethnicity
    );


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

    // Send the request to the OpenAI API
    let response = client.completions().create(request).await.map_err(|e| {
        eprintln!("Error sending request: {}", e);
        actix_web::error::ErrorInternalServerError("Error sending request")
    })?;

    // Process the response according to the response from the API
    if let Some(choice) = response.choices.first() {
        let reply_text = &choice.text;
        Ok(HttpResponse::Ok().body(reply_text.clone()))
    } else {
        Ok(HttpResponse::InternalServerError().body("No response from OpenAI API"))
    }
}