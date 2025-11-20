import express from 'express';
import { auth } from '../middlewares/auth.js';
import {
  fetchAllMaintenance,
  fetchMaintenanceById,
  addMaintenance,
  editMaintenance,
  removeMaintenance
} from '../controllers/maintenanceController.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = express.Router();

router.get('/maintenance', auth, authorizeRoles('staff', 'admin'), fetchAllMaintenance);
router.get('/maintenance/:id', auth, authorizeRoles('staff', 'admin'), fetchMaintenanceById);
router.post('/maintenance', auth, authorizeRoles('staff', 'admin'), addMaintenance);
router.put('/maintenance/:id', auth, authorizeRoles('staff', 'admin'), editMaintenance);
router.delete('/maintenance/:id', auth, authorizeRoles('staff', 'admin'), removeMaintenance);

export default router;