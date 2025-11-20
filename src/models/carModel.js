import pool from '../config/db.js';

export const uploadCarService = async ({ carmodel, caryear, carstatus, maintenanceid, carimageurl }) => {
    const result = await pool.query(`
        INSERT INTO cars (carmodel, caryear, carstatus, maintenanceid, carimageurl, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING carid, carmodel, caryear, carstatus, maintenanceid, carimageurl, created_at
    `, [carmodel, caryear, carstatus, maintenanceid, carimageurl]);
    return result.rows[0];
}