import express from 'express';
import { uploadCar,
        getAllCars,
        getCarById,
        updateCarByID,
        deleteCarByID,
        searchCars
 } from '../controllers/carController.js';
import { auth } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';
const router = express.Router();

router.post('/uploadCar', auth,authorizeRoles('staff'),uploadCar);
router.get('/cars', getAllCars);
router.get('/search', searchCars);
router.get('/cars/:id', auth, getCarById);
router.put('/cars/:id',auth,updateCarByID);
router.delete('/cars/:id',auth, deleteCarByID);

export default router;