import pool from "../config/db.js";

export const createRentalsTable = async () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS rentals (
    bookingId SERIAL PRIMARY KEY,
    customerId INT NOT NULL,
    userId INT NOT NULL,
    staffId INT,
    carId INT NOT NULL,
    paymentId INT NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    totalAmount NUMERIC(12,2) NOT NULL CHECK (totalAmount >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'requested' CHECK (status IN ('completed', 'declined', 'requested', 'active')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_rental_dates CHECK (startDate < endDate),

    CONSTRAINT fk_rental_customer
        FOREIGN KEY (customerId)
        REFERENCES customers(customerId)
        ON DELETE RESTRICT,

    CONSTRAINT fk_rental_user
        FOREIGN KEY (userId)
        REFERENCES users(userId)
        ON DELETE RESTRICT,

    CONSTRAINT fk_rental_staff
        FOREIGN KEY (staffId)
        REFERENCES staff(staffId)
        ON DELETE SET NULL,

    CONSTRAINT fk_rental_car
        FOREIGN KEY (carId)
        REFERENCES cars(carId)
        ON DELETE RESTRICT,

    CONSTRAINT fk_rental_payment
        FOREIGN KEY (paymentId)
        REFERENCES payments(paymentId)
        ON DELETE RESTRICT
);
 `;
    try {
        await pool.query(queryText);
        console.log("Rentals table created successfully");
    } catch (error) {
        console.error("Error creating rentals table:", error);
    }
};

export default createRentalsTable;