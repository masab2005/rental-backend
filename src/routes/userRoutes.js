import express from 'express';
import { auth } from '../middlewares/auth.js';
import {
    createUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} from '../controllers/userController.js';
const router = express.Router();

router.post('/register',createUser);
router.post('/login',loginUser)
router.get('/users',getAllUsers);
router.get('/users/:id',getUserById); 
router.put('/users/:id',updateUser);
router.delete('/users/:id',deleteUser);

export default router;