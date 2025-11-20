import pool from "../config/db.js";

const createMaintenanceTable = async () => {
    const queryText = `
   CREATE TABLE IF NOT EXISTS maintenance (
    MaintenanceID SERIAL PRIMARY KEY,
    MaintenanceIDate DATE NOT NULL,
    MaintenanceIType VARCHAR(100) NOT NULL,
    MaintenanceICost DECIMAL(10,2) NOT NULL
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