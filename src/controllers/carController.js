import { uploadCarService } from "../models/carModel.js";
const handerResponse = (res,status, message, data = null) => {
    res.status(status).json({
        status,
        message,
        data
    });
}
export const uploadCar = async (req, res, next) => {
    const { carmodel, caryear, carstatus, maintenanceid, carimageurl } = req.body; 
    if (!carmodel || !caryear || !carstatus || !carimageurl) {
        return handerResponse(res, 400, 'fields are missing in car info');
    } 
    try {
        const newCar = await uploadCarService({ carmodel, caryear, carstatus, maintenanceid, carimageurl });
        handerResponse(res, 201, 'Car uploaded successfully', newCar);
    } catch (error) {
        next(error);
    }
}