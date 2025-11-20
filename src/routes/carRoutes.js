import express from 'express';
import { uploadCar,
        getAllCars,
        getCarById,
        updateCarByID,
        deleteCarByID,
 } from '../controllers/carController.js';
import { auth } from '../middlewares/auth.js';
import { updateCarByIDService } from '../models/carModel.js';
const router = express.Router();

router.post('/uploadCar', auth, uploadCar);
router.get('/cars', getAllCars);
router.get('/cars/:id', auth, getCarById);
router.put('/cars/:id',auth,updateCarByID);
router.delete('/cars/:id',auth, deleteCarByID);

export default router;