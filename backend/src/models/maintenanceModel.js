import pool from '../config/db.js';

export const getAllMaintenance = async () => {
  const result = await pool.query('SELECT * FROM maintenance ORDER BY maintenancedate DESC');
  return result.rows;
};

export const getMaintenanceById = async (id) => {
  const result = await pool.query('SELECT * FROM maintenance WHERE maintenanceid = $1', [id]);
  return result.rows[0];
};

export const createMaintenanceWithCarLink = async (carId, { maintenanceDate, maintenanceType, maintenanceCost }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const insertResult = await client.query(
      `INSERT INTO maintenance (maintenancedate, maintenancetype, maintenancecost)
       VALUES ($1, $2, $3)
       RETURNING maintenanceid`,
      [maintenanceDate, maintenanceType, maintenanceCost]
    );

    const maintenanceid = insertResult.rows[0].maintenanceid;

    await client.query(
      `UPDATE cars SET maintenanceid = $1 WHERE carid = $2`,
      [maintenanceid, carId]
    );

    await client.query('COMMIT');
    return { maintenanceid };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const updateMaintenanceWithCarCheck = async (maintenanceId, { maintenanceDate, maintenanceType, maintenanceCost }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updateResult = await client.query(
      `UPDATE maintenance
       SET maintenancedate = $1, maintenancetype = $2, maintenancecost = $3
       WHERE maintenanceid = $4
       RETURNING *`,
      [maintenanceDate, maintenanceType, maintenanceCost, maintenanceId]
    );

    const carCheck = await client.query(
      `SELECT carid FROM cars WHERE maintenanceid = $1`,
      [maintenanceId]
    );

    await client.query('COMMIT');
    return {
      updated: updateResult.rows[0],
      linkedCar: carCheck.rows[0] || null
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const deleteMaintenanceAndUnlinkCar = async (maintenanceId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE cars SET maintenanceid = NULL WHERE maintenanceid = $1`,
      [maintenanceId]
    );

    const deleteResult = await client.query(
      `DELETE FROM maintenance WHERE maintenanceid = $1 RETURNING *`,
      [maintenanceId]
    );

    await client.query('COMMIT');
    return deleteResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};