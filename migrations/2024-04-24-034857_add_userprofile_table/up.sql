-- Your SQL goes here
-- Create the userprofiles table
CREATE TABLE peopleINmylife (
    person_id SERIAL PRIMARY KEY,  -- Auto-incrementing primary key
    person_name VARCHAR(50),  -- Person's name with a max length of 50
    relationship VARCHAR(50),  -- Relationship type
    score INT,  -- Score of the person
    scoretome INT,  -- Score related to the current user
    occupation VARCHAR(50),  -- Occupation with a max length of 50
    edulv VARCHAR(50),  -- Education level, adjusted to consistent naming
    personselfscore INT,  -- Self-assessment score for the person
    mbti VARCHAR(10),  -- MBTI type, typically four characters
    attachment_style VARCHAR(20),  -- Renamed to remove space
    medical_history TEXT,  -- Text for medical history
    gender VARCHAR(20),  -- Gender with a character limit
    age INT,  -- Person's age
    heritage_ethnicity VARCHAR(50),  -- Renamed for consistency
    comfortLv INT  -- Level of comfort
);



CREATE TABLE userprofiles (
    profile_id SERIAL PRIMARY KEY,  -- Automatically incrementing ID
    account_id INT,  -- Reference to account table
    user_name VARCHAR(50),  -- Up to 50 characters for user name
    age INT,  -- User's age
    occupation VARCHAR(50),  -- Occupation with a maximum of 50 characters
    education_level VARCHAR(50),  -- Education level, ensuring consistent naming
    people JSONB,  -- Foreign key referencing the peopleINmylife table
    selfscore INT,  -- Self-assessment score
    selfscorepeople INT,  -- Score based on people in the user's life
    mbti VARCHAR(10),  -- Myers-Briggs type, usually 4 characters
    attachment_style VARCHAR(20),  -- Attachment style, limited to 20 characters
    medical_history TEXT,  -- Text for medical history, allowing up to 300 words
    gender VARCHAR(20),  -- Gender with a max of 20 characters
    heritage_ethnicity VARCHAR(50),  -- Heritage or ethnicity, allowing 50 characters
    sexual_preference VARCHAR(20),  -- Sexual preference, allowing 20 characters
    journel TEXT[],  -- Array of text for journal entries
    FOREIGN KEY (account_id) REFERENCES accounts(id)  -- Correct reference
);
