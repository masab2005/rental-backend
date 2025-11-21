import pool from '../config/db.js';

export const getAllMaintenance = async () => {
  const result = await pool.query('SELECT * FROM maintenance ORDER BY maintenancedate DESC');
  return result.rows;
};

export const getMaintenanceById = async (id) => {
  const result = await pool.query('SELECT * FROM maintenance WHERE maintenanceid = $1', [id]);
  return result.rows[0];
};

export const createMaintenanceWithCarLink = async (carid, { maintenancedate, maintenancetype, maintenancecost }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const insertResult = await client.query(
      `INSERT INTO maintenance (maintenancedate, maintenancetype, maintenancecost)
       VALUES ($1, $2, $3)
       RETURNING maintenanceid`,
      [maintenancedate, maintenancetype, maintenancecost]
    );

    const maintenanceid = insertResult.rows[0].maintenanceid;

    await client.query(
      `UPDATE cars SET maintenanceid = $1 WHERE carid = $2`,
      [maintenanceid, carid]
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

export const updateMaintenanceWithCarCheck = async (maintenanceid, { maintenancedate, maintenancetype, maintenancecost }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updateResult = await client.query(
      `UPDATE maintenance
       SET maintenancedate = $1, maintenancetype = $2, maintenancecost = $3
       WHERE maintenanceid = $4
       RETURNING *`,
      [maintenancedate, maintenancetype, maintenancecost, maintenanceid]
    );

    const carCheck = await client.query(
      `SELECT carid FROM cars WHERE maintenanceid = $1`,
      [maintenanceid]
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

export const deleteMaintenanceAndUnlinkCar = async (maintenanceid) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE cars SET maintenanceid = NULL WHERE maintenanceid = $1`,
      [maintenanceid]
    );

    const deleteResult = await client.query(
      `DELETE FROM maintenance WHERE maintenanceid = $1 RETURNING *`,
      [maintenanceid]
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