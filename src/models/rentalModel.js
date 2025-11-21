import pool from '../config/db.js';

export const createRentalService = async ({
  customerId,
  userId,
  staffId = null,
  carId,
  paymentId,
  startDate,
  endDate,
  totalAmount
}) => {
  const client = await pool.connect();
 
  try {
    await client.query("BEGIN");

    // 1) Update car status to 'requested'
    await client.query(
      `UPDATE cars SET carStatus = 'requested' WHERE carId = $1`,
      [carId]
    );

    // 2) Insert rental
    const insertQuery = `
      INSERT INTO rentals
        (customerId, userId, staffId, carId, paymentId, startDate, endDate, totalAmount)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *;
    `;
    const values = [
      customerId,
      userId,
      staffId,
      carId,
      paymentId,
      startDate,
      endDate,
      totalAmount
    ];

    const { rows } = await client.query(insertQuery, values);

    await client.query("COMMIT");
    return rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const getRentalHistoryService = async (userId) => {
  // 1) Lookup customerId from userId
  const { rows: custRows } = await pool.query(
    `SELECT "customerId" FROM customers WHERE "userId" = $1`,
    [userId]
  );

  if (custRows.length === 0) {
    throw new Error("Customer not found");
  }

  const customerId = custRows[0].customerId;

  // 2) Fetch completed (returned) rentals: carStatus = 'available'
  const { rows: rentals } = await pool.query(
    `
      SELECT 
        r."bookingId",
        r."carId",
        c."carModel",
        c."carImageUrl",
        r."startDate",
        r."endDate",
        r."totalAmount",
        r."paymentId"
      FROM rentals r
      JOIN cars c ON r."carId" = c."carId"
      WHERE r."customerId" = $1
        AND c."carStatus" = 'available'
      ORDER BY r."startDate" DESC
      LIMIT 10
    `,
    [customerId]
  );

  return rentals;
};


export const getRequestedRentalsService = async () => {
  const { rows } = await pool.query(
    `
      SELECT r.bookingId,
             r.carId,
             c.carModel,
             c.carImageUrl,
             r.startDate,
             r.endDate,
             r.totalAmount,
             r.paymentId,
             r.staffId,
             u.username AS customerUsername,
             cu.customerName,
             cu.customerPhone
      FROM rentals r
      JOIN cars c ON r.carId = c.carId
      JOIN customers cu ON r.customerId = cu.customerId
      JOIN users u ON cu.userId = u.userId
      WHERE c.carStatus = 'requested'
      ORDER BY r.startDate ASC
    `
  );

  return rows;
};

export const approveRentalService = async ({ bookingId, staffId }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1) Check rental and car status
    const { rows } = await client.query(`
      SELECT r.carId, c.carStatus
      FROM rentals r
      JOIN cars c ON r.carId = c.carId
      WHERE r.bookingId = $1
      FOR UPDATE
    `, [bookingId]);

    if (rows.length === 0) {
      throw new Error("Rental not found");
    }

    const { carid, carstatus } = rows[0];
    console.log(carid,carstatus);
    if (carstatus !== 'requested') {
      throw new Error("Car is not in requested status");
    }

    // 2) Update carStatus to 'rented'
    await client.query(`
      UPDATE cars
      SET carStatus = 'rented'
      WHERE carId = $1
    `, [carid]);

    // 3) Update rentals table with staffId
    await client.query(`
      UPDATE rentals
      SET staffId = $1
      WHERE bookingId = $2
    `, [staffId, bookingId]);

    await client.query("COMMIT");
    return { bookingId, carid, staffId };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const getRentedCarsByUserService = async (userId) => {
  const { rows } = await pool.query(
    `
    SELECT
      r.bookingId,
      r.userId,
      r.customerId,
      r.carId,
      c.carmodel AS carModel,
      c.carimageurl AS carImageUrl,
      c.carstatus AS carStatus,
      r.startDate,
      r.endDate,
      r.totalAmount,
      r.paymentId
    FROM rentals r
    JOIN cars c ON r.carId = c.carId
    WHERE r.userId = $1
      AND c.carstatus = 'rented'
    ORDER BY r.startDate DESC;
    `,
    [userId]
  );

  return rows;
};

export const getRequestedRentalsByUserService = async (userId) => {
  const { rows } = await pool.query(
    `
    SELECT
      r.bookingId,
      r.carId,
      c.carmodel AS carModel,
      c.carimageurl AS carImageUrl,
      r.startDate,
      r.endDate,
      r.totalAmount,
      r.paymentId
    FROM rentals r
    JOIN cars c ON r.carId = c.carId
    WHERE r.userId = $1
      AND c.carstatus = 'requested'
    ORDER BY r.startDate ASC;
    `,
    [userId]
  );

  return rows;
};

export const endRentalService = async (bookingId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1) Lock rental and car row
    const { rows } = await client.query(
      `SELECT r.carid, c.carstatus
       FROM rentals r
       JOIN cars c ON r.carid = c.carid
       WHERE r.bookingid = $1
       FOR UPDATE`,
      [bookingId]
    );

    if (rows.length === 0) {
      throw new Error("Rental not found");
    }

    const { carid, carstatus } = rows[0];
    if (carstatus !== 'rented') {
      throw new Error("Car is not currently rented");
    }

    // 2) Update car status back to 'available'
    await client.query(
      `UPDATE cars SET carstatus = 'available' WHERE carid = $1`,
      [carid]
    );

    // 3) Optionally mark rental as completed (add a status column if needed)
    await client.query(
      `UPDATE rentals SET updated_at = NOW() WHERE bookingid = $1`,
      [bookingId]
    );

    await client.query("COMMIT");
    return { bookingId, carid, status: 'ended' };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};