
import pool from "../config/db.js";

const createCarsTable = async () => {
    const queryText = `
   CREATE TABLE IF NOT EXISTS cars (
    carid SERIAL PRIMARY KEY,
    carmodel VARCHAR(100) NOT NULL,
    caryear INT NOT NULL CHECK (caryear >= 1980 AND caryear <= EXTRACT(YEAR FROM CURRENT_DATE)),
    carstatus VARCHAR(20) NOT NULL CHECK (carstatus IN ('available', 'requested', 'rented', 'maintenance')),
    maintenanceid INT,
    carimageurl VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_maintenance
        FOREIGN KEY (maintenanceid)
        REFERENCES maintenance(maintenanceid)
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