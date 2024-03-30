// @generated automatically by Diesel CLI.

diesel::table! {
    accounts (id) {
        id -> Int4,
        #[max_length = 255]
        username -> Varchar,
        hashed_password -> Text,
        account_type -> Varchar,
        created_at -> Nullable<Timestamp>,
    }
}
