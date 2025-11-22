import pool from "../config/db.js";

const createPaymentTable = async () => {
    const queryText = `
   CREATE TABLE IF NOT EXISTS payments (
    paymentId SERIAL PRIMARY KEY,
    paymentAmount NUMERIC(12,2) NOT NULL CHECK (paymentAmount > 0),
    paymentDate TIMESTAMP NOT NULL DEFAULT NOW(),
    paymentMethod VARCHAR(20) NOT NULL CHECK (paymentMethod IN ('visa', 'mastercard')),
    cardNumber VARCHAR(16) NOT NULL CHECK (LENGTH(cardNumber) = 16)
);
 `;
    try {
        await pool.query(queryText);
        console.log("Payment table created successfully");
    } catch (error) {
        console.error("Error creating payment table:", error);
    }
};

export default createPaymentTable;