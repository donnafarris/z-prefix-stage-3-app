/* Deletes Database Tables */

DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Posts;

/* Creates Database Tables */

CREATE TABLE Users (
    User_ID SERIAL,
    First_Name TEXT NOT NULL,
    Last_Name TEXT NOT NULL,
    Username TEXT UNIQUE NOT NULL,
    Password TEXT NOT NULL,
    PRIMARY KEY (User_ID)
);

CREATE TABLE Posts (
    Post_ID SERIAL,
    Creation_Date DATE NOT NULL,
    Author INTEGER NOT NULL,
    Title TEXT NOT NULL,
    Content TEXT,
    PRIMARY KEY (Post_ID),
    FOREIGN KEY (Author) REFERENCES Users (User_ID)
);