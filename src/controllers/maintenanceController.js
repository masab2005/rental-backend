import {
  getAllMaintenance,
  getMaintenanceById,
  createMaintenanceWithCarLink,
  updateMaintenanceWithCarCheck,
  deleteMaintenanceAndUnlinkCar
} from '../models/maintenanceModel.js';

export const fetchAllMaintenance = async (req, res, next) => {
  try {
    const data = await getAllMaintenance();
    res.status(200).json({ status: 200, message: 'Maintenance records retrieved', data });
  } catch (error) {
    next(error);
  }
};

export const fetchMaintenanceById = async (req, res, next) => {
  try {
    const data = await getMaintenanceById(req.params.id);
    if (!data) return res.status(404).json({ message: 'Maintenance record not found' });
    res.status(200).json({ status: 200, message: 'Maintenance record retrieved', data });
  } catch (error) {
    next(error);
  }
};

export const addMaintenance = async (req, res, next) => {
  try {
    const { carid, maintenancedate, maintenancetype, maintenancecost } = req.body;
    const result = await createMaintenanceWithCarLink(carid, { maintenancedate, maintenancetype, maintenancecost });
    res.status(201).json({ status: 201, message: 'Maintenance created and linked to car', data: result });
  } catch (error) {
    next(error);
  }
};

export const editMaintenance = async (req, res, next) => {
  try {
    const { maintenancedate, maintenancetype, maintenancecost } = req.body;
    const result = await updateMaintenanceWithCarCheck(req.params.id, { maintenancedate, maintenancetype, maintenancecost });
    if (!result.updated) return res.status(404).json({ message: 'Maintenance record not found' });
    res.status(200).json({ status: 200, message: 'Maintenance updated', data: result });
  } catch (error) {
    next(error);
  }
};

export const removeMaintenance = async (req, res, next) => {
  try {
    const result = await deleteMaintenanceAndUnlinkCar(req.params.id);
    if (!result) return res.status(404).json({ message: 'Maintenance record not found' });
    res.status(200).json({ status: 200, message: 'Maintenance deleted and unlinked from car', data: result });
  } catch (error) {
    next(error);
  }
};