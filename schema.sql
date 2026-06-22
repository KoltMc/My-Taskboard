CREATE DATABASE IF NOT EXISTS taskboardusers;
USE taskboardusers;

CREATE TABLE IF NOT EXISTS user (
    username VARCHAR(20) PRIMARY KEY,
    password VARCHAR(255)
);
