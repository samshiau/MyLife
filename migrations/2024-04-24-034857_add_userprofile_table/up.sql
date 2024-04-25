-- Your SQL goes here
-- Create the userprofiles table
CREATE TABLE peopleINmylife (
    person_id SERIAL PRIMARY KEY,  -- Auto-incrementing primary key
    person_name VARCHAR(50),  -- Person's name with a max length of 50
    relationship VARCHAR(50),  -- Relationship type
    score INT NULL,  -- Score of the person
    scoretome INT NULL,  -- Score related to the current user
    occupation VARCHAR(50) NULL,  -- Occupation with a max length of 50
    edulv VARCHAR(50) NULL,  -- Education level, adjusted to consistent naming
    personselfscore INT NULL,  -- Self-assessment score for the person
    mbti VARCHAR(10) NULL,  -- MBTI type, typically four characters
    attachment_style VARCHAR(20) NULL,  -- Renamed to remove space
    medical_history TEXT NULL,  -- Text for medical history
    gender VARCHAR(20) NULL,  -- Gender with a character limit
    age INT NULL,  -- Person's age
    heritage_ethnicity VARCHAR(50) NULL,  -- Renamed for consistency
    comfortLv INT NULL  -- Level of comfort
);



CREATE TABLE userprofiles (
    profile_id SERIAL PRIMARY KEY,  -- Automatically incrementing ID
    account_id INT,  -- Reference to account table
    user_name VARCHAR(50),  -- Up to 50 characters for user name
    age INT NULL,  -- User's age
    occupation VARCHAR(50) NULL,  -- Occupation with a maximum of 50 characters
    education_level VARCHAR(50) NULL,  -- Education level, ensuring consistent naming
    people JSONB NULL,  -- Foreign key referencing the peopleINmylife table
    selfscore INT NULL,  -- Self-assessment score
    selfscorepeople INT NULL,  -- Score based on people in the user's life
    mbti VARCHAR(10) NULL,  -- Myers-Briggs type, usually 4 characters
    attachment_style VARCHAR(20) NULL,  -- Attachment style, limited to 20 characters
    medical_history TEXT NULL,  -- Text for medical history, allowing up to 300 words
    gender VARCHAR(20) NULL,  -- Gender with a max of 20 characters
    heritage_ethnicity VARCHAR(50) NULL,  -- Heritage or ethnicity, allowing 50 characters
    sexual_preference VARCHAR(20) NULL,  -- Sexual preference, allowing 20 characters
    journel TEXT[] NULL,  -- Array of text for journal entries
    FOREIGN KEY (account_id) REFERENCES accounts(id)  -- Correct reference
);
