import pool from '../config/db.js';
import { getAllCars } from '../controllers/carController.js';

export const uploadCarService = async ({ carmodel, caryear, carstatus, maintenanceid, carimageurl }) => {
    const result = await pool.query(`
        INSERT INTO cars (carmodel, caryear, carstatus, maintenanceid, carimageurl, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING carid, carmodel, caryear, carstatus, maintenanceid, carimageurl, created_at
    `, [carmodel, caryear, carstatus, maintenanceid, carimageurl]);
    return result.rows[0];
}

export const getAllCarsService = async () => {
    const result = await pool.query(`
        SELECT carid, carmodel, caryear, carstatus, maintenanceid, carimageurl, created_at
        FROM cars`);
    return result.rows;
}

export const getCarByIdService = async (id) => {
    const result = await pool.query(`
        SELECT carid, carmodel, caryear, carstatus, maintenanceid, carimageurl, created_at
        FROM cars
        WHERE carid = $1
    `, [id]);
    return result.rows[0];
}

// services/carService.js
export const updateCarByIDService = async (carid, carData) => {
    const { carmodel, caryear, carstatus, maintenanceid, carimageurl } = carData;

    const result = await pool.query(`
        UPDATE cars
        SET carmodel = $1,
            caryear = $2,
            carstatus = $3,
            maintenanceid = $4,
            carimageurl = $5
        WHERE carid = $6
        RETURNING carid, carmodel, caryear, carstatus, maintenanceid, carimageurl, created_at
    `, [carmodel, caryear, carstatus, maintenanceid, carimageurl, carid]);

    return result.rows[0]; // return the updated car
};

// services/carService.js
export const deleteCarByIDService = async (carid) => {
    const result = await pool.query(`
        DELETE FROM cars
        WHERE carid = $1
        RETURNING carid, carmodel, caryear, carstatus, maintenanceid, carimageurl, created_at
    `, [carid]);

    return result.rows[0]; // will be undefined if no car was found
};