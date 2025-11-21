import express from 'express';
import { createRental,getRentalHistory, getRequestedRentals, approveRentals,rentedCarsByUser, requestedRentalsByUser,endRental} from '../controllers/rentalController.js';
import { auth } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = express.Router();

//user routes
router.post('/create', auth, createRental);
router.get('/previousRentals/:id',auth, getRentalHistory);
router.get('/currentRentals/:id',auth, rentedCarsByUser);
router.get('/pendingRequests/:id',auth,requestedRentalsByUser)

//staff routes
router.get('/pendingRequests',auth,authorizeRoles('admin','staff'),getRequestedRentals);
router.post('/approveRental',auth,authorizeRoles('admin','staff'),approveRentals);
// staff route to end rental
router.post('/endRental', auth, authorizeRoles('admin','staff'), endRental);
export default router;
