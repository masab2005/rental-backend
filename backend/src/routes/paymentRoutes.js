import express from 'express';
import { auth } from '../middlewares/auth.js';
import { confirmPayment,getPaymentById } from '../controllers/paymentController.js';
const router = express.Router();
    
router.post('/confirmPayment', auth, confirmPayment);
router.get('/getPaymentById/:id', auth, getPaymentById);
export default router;