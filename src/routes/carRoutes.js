import express from 'express';
import { uploadCar } from '../controllers/carController.js';
import { auth } from '../middlewares/auth.js';
const router = express.Router();

router.post('/uploadCar', auth, uploadCar);

export default router;