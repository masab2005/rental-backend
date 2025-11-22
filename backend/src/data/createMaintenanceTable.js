import pool from "../config/db.js";

const createMaintenanceTable = async () => {
    const queryText = `
   CREATE TABLE IF NOT EXISTS maintenance (
    maintenanceId SERIAL PRIMARY KEY,
    maintenanceDate DATE NOT NULL,
    maintenanceType VARCHAR(100) NOT NULL,
    maintenanceCost DECIMAL(10,2) NOT NULL
);
 `;
    try {
        await pool.query(queryText);
        console.log("Maintenance table created successfully");
    } catch (error) {
        console.error("Error creating maintenance table:", error);
    }
};

export default createMaintenanceTable;