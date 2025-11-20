import { uploadCarService,getAllCarsService,getCarByIdService ,updateCarByIDService,deleteCarByIDService} from "../models/carModel.js";
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

export const getAllCars = async (req, res, next) => {
    try {
        const result = await getAllCarsService();
        handerResponse(res, 200, 'Cars retrieved successfully', result);
    } catch (error) {
        next(error);
    }
}

export const getCarById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await getCarByIdService(id);
        if (!result) {
            return handerResponse(res, 404, 'Car not found');
        }
        handerResponse(res, 200, 'Car retrieved successfully', result);
    } catch (error) {
        next(error);
    }
}

// controllers/carController.js
export const updateCarByID = async (req, res, next) => {
    try {
        const { id } = req.params; // carid from URL
        const carData = req.body;  // updated fields from request body

        const updatedCar = await updateCarByIDService(id, carData);

        if (!updatedCar) {
            return handerResponse(res, 404, 'Car not found');
        }

        handerResponse(res, 200, 'Car updated successfully', updatedCar);
    } catch (error) {
        next(error);
    }
};

// controllers/carController.js
export const deleteCarByID = async (req, res, next) => {
    try {
        const { id } = req.params; // carid from URL

        const deletedCar = await deleteCarByIDService(id);

        if (!deletedCar) {
            return handlerResponse(res, 404, 'Car not found');
        }

        handlerResponse(res, 200, 'Car deleted successfully', deletedCar);
    } catch (error) {
        next(error);
    }
};