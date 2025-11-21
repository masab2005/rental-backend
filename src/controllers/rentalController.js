import { createRentalService } from '../models/rentalModel.js';
import pool from '../config/db.js';
import handerResponse from '../utils/handerResponse.js';
import { 
  getRentalHistoryService,
  getRequestedRentalsService, 
  approveRentalService,
  getRentedCarsByUserService,
  getRequestedRentalsByUserService,
  endRentalService
 } from '../models/rentalModel.js';
export const createRental = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      carId,
      totalAmount,
      paymentId,
      userId
    } = req.body;

    // 1) required fields check
    if (!startDate || !endDate || !carId || !totalAmount || !paymentId || !userId) {
      return handerResponse(res, 400, 'Fields are missing in rental info');
    }

    // 2) parse & validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return handerResponse(res, 400, 'Invalid startDate or endDate format');
    }
    if (start >= end) {
      return handerResponse(res, 400, 'startDate must be before endDate');
    }

    // 3) validate totalAmount
    const amountNum = Number(totalAmount);
    if (Number.isNaN(amountNum) || amountNum < 0) {
      return handerResponse(res, 400, 'totalAmount must be a non-negative number');
    }

    // 4) validate IDs
    const carIdNum = Number(carId);
    const paymentIdNum = Number(paymentId);
    const userIdNum = Number(userId);

    if ([carIdNum, paymentIdNum, userIdNum].some(n => !Number.isInteger(n) || n <= 0)) {
      return handerResponse(res, 400, 'carId, paymentId, and userId must be positive integers');
    }

    // 5) Lookup customerId from userId
    const { rows: custRows } = await pool.query(
      `SELECT customerId FROM customers WHERE userId = $1`,
      [userIdNum]
    );
    if (custRows.length === 0) {
      return handerResponse(res, 400, 'Customer record not found for this user');
    }
    const customerIdNum = custRows[0].customerid;

    // 6) Check if the car is already booked for the selected dates
    const { rows: existing } = await pool.query(
      `SELECT 1 FROM rentals 
       WHERE carId = $1 
         AND NOT (endDate < $2 OR startDate > $3)`,
      [carIdNum, start.toISOString().slice(0,10), end.toISOString().slice(0,10)]
    );

    if (existing.length > 0) {
      return handerResponse(res, 400, 'Car is already booked for the selected dates');
    }

    // 7) Create rental (staffId is null for now)
    const rental = await createRentalService({
      customerId: customerIdNum,
      userId: userIdNum,
      staffId: null,
      carId: carIdNum,
      paymentId: paymentIdNum,
      startDate: start.toISOString().slice(0,10),
      endDate: end.toISOString().slice(0,10),
      totalAmount: amountNum
    });

    return handerResponse(res, 201, 'Rental created successfully', rental);
  } catch (err) {
    return next(err);
  }
};

export const getRentalHistory = async (req, res, next) => {
  try {
    const { id } = req.params; 
    if (!id) {
      return handerResponse(res, 400, "userId is required");
    }

    const rentals = await getRentalHistoryService(id);

    return handerResponse(res, 200, "Rental history fetched successfully", rentals);
  } catch (err) {
    next(err);
  }
};

export const getRequestedRentals = async (req, res, next) => {
  try {
    const rentals = await getRequestedRentalsService();
    return handerResponse(res, 200, "Requested rentals fetched successfully", rentals);
  } catch (err) {
    next(err);
  }
};

export const approveRentals = async (req, res, next) => {
  try {
    const { bookingId, staffId } = req.body;

    if (!bookingId || !staffId) {
      return handerResponse(res, 400, "bookingId and staffId are required");
    }

    const bookingIdNum = Number(bookingId);
    const staffIdNum = Number(staffId);

    if ([bookingIdNum, staffIdNum].some(n => !Number.isInteger(n) || n <= 0)) {
      return handerResponse(res, 400, "bookingId and staffId must be positive integers");
    }

    const result = await approveRentalService({ bookingId: bookingIdNum, staffId: staffIdNum });

    return handerResponse(res, 201, "Rental approved successfully", result);
  } catch (err) {
    return next(err);
  }
};

export const rentedCarsByUser = async (req, res, next) => {
  try {
    const { id } = req.params; 

    if (!id) {
      return handerResponse(res, 400, "userId is required");
    }

    const userIdNum = Number(id);
    if (!Number.isInteger(userIdNum) || userIdNum <= 0) {
      return handerResponse(res, 400, "userId must be a positive integer");
    }

    const rentals = await getRentedCarsByUserService(userIdNum);
    return handerResponse(res, 200, "Rented cars fetched successfully", rentals);
  } catch (err) {
    return next(err);
  }
};

export const requestedRentalsByUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return handerResponse(res, 400, "userId is required");
    }

    const userIdNum = Number(id);
    if (!Number.isInteger(userIdNum) || userIdNum <= 0) {
      return handerResponse(res, 400, "userId must be a positive integer");
    }

    const rentals = await getRequestedRentalsByUserService(userIdNum);
    return handerResponse(res, 200, "Requested rentals fetched successfully", rentals);
  } catch (err) {
    return next(err);
  }
};

export const endRental = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return handerResponse(res, 400, "bookingId is required");
    }

    const bookingIdNum = Number(bookingId);
    if (!Number.isInteger(bookingIdNum) || bookingIdNum <= 0) {
      return handerResponse(res, 400, "bookingId must be a positive integer");
    }

    const result = await endRentalService(bookingIdNum);

    return handerResponse(res, 200, "Rental ended successfully", result);
  } catch (err) {
    next(err);
  }
};