
import pool from "../config/db.js";

const createCarsTable = async () => {
    const queryText = `
   CREATE TABLE IF NOT EXISTS cars (
    carId SERIAL PRIMARY KEY,
    carModel VARCHAR(100) NOT NULL,
    carYear INT NOT NULL CHECK (carYear >= 1980 AND carYear <= EXTRACT(YEAR FROM CURRENT_DATE)),
    carStatus VARCHAR(20) NOT NULL CHECK (carStatus IN ('available', 'requested', 'rented', 'maintenance')),
    carPrice NUMERIC(10,2) NOT NULL CHECK (carPrice >= 0),
    maintenanceId INT,
    carImageUrl VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_maintenance
        FOREIGN KEY (maintenanceId)
        REFERENCES maintenance(maintenanceId)
        ON DELETE SET NULL
);

 `;
    try {
        await pool.query(queryText);
        console.log("Cars table created successfully");
    } catch (error) {
        console.error("Error creating cars table:", error);
    }
};

export default createCarsTable;