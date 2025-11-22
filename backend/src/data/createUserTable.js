import pool from "../config/db.js";

const createUserTable = async () => {
    const queryText = `
   CREATE TABLE IF NOT EXISTS users (
    userId SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'staff')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
 `;
    try {
        await pool.query(queryText);
        console.log("User table created successfully");
    } catch (error) {
        console.error("Error creating user table:", error);
    }
};

export default createUserTable;