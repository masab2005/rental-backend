import pool from "../config/db.js";

export const confirmPaymentService = async ({ paymentAmount, paymentMethod, cardNumber }) => {
    const query = `
        INSERT INTO payments (paymentAmount, paymentMethod, cardNumber)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [
        paymentAmount,
        paymentMethod.toLowerCase(),
        cardNumber
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const getPaymentByIdService = async (id) => {
    const { rows } = await pool.query("SELECT * FROM payments WHERE paymentId = $1;", [id]);
    return rows[0];
}