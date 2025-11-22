import pool from "../config/db.js";

const createCustomerTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS customers (
      customerId SERIAL PRIMARY KEY,
      userId INT UNIQUE NOT NULL,
      customerName VARCHAR(100) NOT NULL,
      customerPhone CHAR(11) NOT NULL UNIQUE CHECK (customerPhone ~ '^[0-9]{11}$'),
      driverLicense VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_customers_user
        FOREIGN KEY (userId)
        REFERENCES users(userId)
        ON DELETE CASCADE
    );
  `;

  try {
    await pool.query(queryText);
    console.log("Customer table created successfully");
  } catch (error) {
    console.error("Error creating customer table:", error);
  }
};

export default createCustomerTable;
