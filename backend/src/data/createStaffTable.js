import pool from "../config/db.js";

const createStaffTable = async () => {
    const queryText = `
   CREATE TABLE IF NOT EXISTS staff (
    staffId SERIAL PRIMARY KEY,
    staffName VARCHAR(100) NOT NULL,
    staffPhone CHAR(11) NOT NULL UNIQUE CHECK (staffPhone ~ '^[0-9]{11}$'),
    userId INT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_staff_user
        FOREIGN KEY (userId)
        REFERENCES users(userId)
        ON DELETE CASCADE
   );
    `;

    try {
        await pool.query(queryText);
        console.log("Staff table created successfully");
    } catch (error) {
        console.error("Error creating staff table:", error);
    }
};

export default createStaffTable;
