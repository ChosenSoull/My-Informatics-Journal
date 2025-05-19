CREATE DATABASE your_database;
USE your_database;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) NOT NULL DEFAULT '/assets/default_user_icon.png',
    login_key VARCHAR(255),
    is_verified TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE verification_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    INDEX idx_email (email),
    INDEX idx_expires_at (expires_at)
);

CREATE TABLE forgot_pass (
    email VARCHAR(255) NOT NULL,
    hashed_reset_key VARCHAR(255) NOT NULL, -- Довжина залежить від хеш-алгоритму
    expires_at DATETIME NOT NULL,
    PRIMARY KEY (email)
);

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
