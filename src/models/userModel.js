import pool from '../config/db.js';
import bcrypt from "bcrypt";

export const createUserAndProfileService = async ({ username, password, role, name, phone, driverLicense }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);

    const insertUserText = `
      INSERT INTO users (username, password, role)
      VALUES ($1, $2, $3)
      RETURNING userid, username, role, created_at
    `;
    const userRes = await client.query(insertUserText, [username, hashed, role]);
    const user = userRes.rows[0];

    let profile = null;
    if (role === "customer") {
      const insertCustomerText = `
        INSERT INTO customers (customername, customerphone, driverlicense, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING customerid, customername, customerphone, driverlicense, created_at
      `;
      const custRes = await client.query(insertCustomerText, [name, phone, driverLicense]);
      profile = custRes.rows[0];
    } else if (role === "staff") {
      const insertStaffText = `
        INSERT INTO staff (staffname, staffphone, created_at)
        VALUES ($1, $2, NOW())
        RETURNING staffid, staffname, staffphone, created_at
      `;
      const staffRes = await client.query(insertStaffText, [name, phone]);
      profile = staffRes.rows[0];
    }
    await client.query("COMMIT");
    return { user, profile };
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (rbErr) {
      console.error("Rollback error:", rbErr);
    }
    throw err;
  } finally {
    client.release();
  }
};

export const getUserByNameService = async (username,role) => {
    const result = await pool.query('SELECT * FROM users WHERE username = $1 AND role = $2'   , [username, role]);
    return result.rows[0];
}

export const getAllUsersService = async () => {
    const result = await pool.query('SELECT userid, username, role, created_at FROM users');
    return result.rows;
}

export const getUserByIdService = async (id) => {
    const result = await pool.query('SELECT userid, username, role, created_at FROM users WHERE userid = $1', [id]);
    return result.rows[0];
}

export const updateUserService = async (id, fields) => {
    const allowed = ['username', 'password'];
    const inputKeys = Object.keys(fields || {}).filter(k => allowed.includes(k));

    if (inputKeys.length === 0) {
        const res = await pool.query(
            'SELECT userid, username, created_at FROM users WHERE userid = $1',
            [id]
        );
        if (res.rows.length === 0) throw new Error('User not found');
        return res.rows[0];
    }

    if (inputKeys.includes('password')) {
        fields.password = await bcrypt.hash(fields.password, 10);
    }

    const setString = inputKeys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = inputKeys.map(k => fields[k]);
    values.push(id);

    const query = `
        UPDATE users
        SET ${setString}
        WHERE userid = $${values.length}
        RETURNING userid, username, role, created_at
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) throw new Error('User not found');
    return result.rows[0];
};

export const deleteUserService = async (id) => {
    const result = await pool.query('DELETE FROM users WHERE userid = $1 RETURNING userid', [id]);
    return result.rows[0];
}