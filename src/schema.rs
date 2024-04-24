// @generated automatically by Diesel CLI.

diesel::table! {
    accounts (id) {
        id -> Int4,
        #[max_length = 255]
        username -> Varchar,
        #[max_length = 255]
        password_hash -> Varchar,
        #[max_length = 50]
        account_type -> Varchar,
    }
}

diesel::table! {
    peopleinmylife (person_id) {
        person_id -> Int4,
        #[max_length = 50]
        person_name -> Nullable<Varchar>,
        #[max_length = 50]
        relationship -> Nullable<Varchar>,
        score -> Nullable<Int4>,
        scoretome -> Nullable<Int4>,
        #[max_length = 50]
        occupation -> Nullable<Varchar>,
        #[max_length = 50]
        edulv -> Nullable<Varchar>,
        personselfscore -> Nullable<Int4>,
        #[max_length = 10]
        mbti -> Nullable<Varchar>,
        #[max_length = 20]
        attachment_style -> Nullable<Varchar>,
        medical_history -> Nullable<Text>,
        #[max_length = 20]
        gender -> Nullable<Varchar>,
        age -> Nullable<Int4>,
        #[max_length = 50]
        heritage_ethnicity -> Nullable<Varchar>,
        comfortlv -> Nullable<Int4>,
    }
}

diesel::table! {
    posts (id) {
        id -> Int4,
        title -> Varchar,
        body -> Text,
        published -> Bool,
    }
}

diesel::table! {
    userprofiles (profile_id) {
        profile_id -> Int4,
        account_id -> Nullable<Int4>,
        #[max_length = 50]
        user_name -> Nullable<Varchar>,
        age -> Nullable<Int4>,
        #[max_length = 50]
        occupation -> Nullable<Varchar>,
        #[max_length = 50]
        education_level -> Nullable<Varchar>,
        people -> Nullable<Jsonb>,
        selfscore -> Nullable<Int4>,
        selfscorepeople -> Nullable<Int4>,
        #[max_length = 10]
        mbti -> Nullable<Varchar>,
        #[max_length = 20]
        attachment_style -> Nullable<Varchar>,
        medical_history -> Nullable<Text>,
        #[max_length = 20]
        gender -> Nullable<Varchar>,
        #[max_length = 50]
        heritage_ethnicity -> Nullable<Varchar>,
        #[max_length = 20]
        sexual_preference -> Nullable<Varchar>,
        journel -> Nullable<Array<Nullable<Text>>>,
    }
}

diesel::joinable!(userprofiles -> accounts (account_id));

diesel::allow_tables_to_appear_in_same_query!(
    accounts,
    peopleinmylife,
    posts,
    userprofiles,
);
