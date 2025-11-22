import { uploadCarService,getAllCarsService,getCarByIdService ,updateCarByIDService,deleteCarByIDService, searchCarsService} from "../models/carModel.js";
import handerResponse from '../utils/handerResponse.js';
export const uploadCar = async (req, res, next) => {
    const { carModel, carYear, carStatus, carPrice, maintenanceId, carImageUrl } = req.body; 
    if (!carModel || !carYear || !carStatus || !carPrice || !carImageUrl) {
        return handerResponse(res, 400, 'fields are missing in car info');
    }
    
    // Validate carPrice
    const priceNum = Number(carPrice);
    if (Number.isNaN(priceNum) || priceNum < 0) {
        return handerResponse(res, 400, 'carPrice must be a non-negative number');
    }
    
    try {
        const newCar = await uploadCarService({ carModel, carYear, carStatus, carPrice: priceNum, maintenanceId, carImageUrl });
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
            return handerResponse(res, 404, 'Car not found');
        }

        handerResponse(res, 200, 'Car deleted successfully', deletedCar);
    } catch (error) {
        next(error);
    }
};

export const searchCars = async (req, res, next) => {
    try {
        const {
            model,
            year,
            yearMin,
            yearMax,
            status,
            priceMin,
            priceMax,
            sort,
            page = 1,
            limit = 20
        } = req.query;

        // Validate numeric fields
        if (year && (Number.isNaN(Number(year)) || Number(year) <= 0)) {
            return handerResponse(res, 400, 'year must be a positive number');
        }
        if (yearMin && (Number.isNaN(Number(yearMin)) || Number(yearMin) <= 0)) {
            return handerResponse(res, 400, 'yearMin must be a positive number');
        }
        if (yearMax && (Number.isNaN(Number(yearMax)) || Number(yearMax) <= 0)) {
            return handerResponse(res, 400, 'yearMax must be a positive number');
        }
        if (priceMin && (Number.isNaN(Number(priceMin)) || Number(priceMin) < 0)) {
            return handerResponse(res, 400, 'priceMin must be a non-negative number');
        }
        if (priceMax && (Number.isNaN(Number(priceMax)) || Number(priceMax) < 0)) {
            return handerResponse(res, 400, 'priceMax must be a non-negative number');
        }
        if (page && (Number.isNaN(Number(page)) || Number(page) <= 0)) {
            return handerResponse(res, 400, 'page must be a positive number');
        }
        if (limit && (Number.isNaN(Number(limit)) || Number(limit) <= 0)) {
            return handerResponse(res, 400, 'limit must be a positive number');
        }

        const result = await searchCarsService({
            model: model ? String(model).trim() : null,
            year: year ? Number(year) : null,
            yearMin: yearMin ? Number(yearMin) : null,
            yearMax: yearMax ? Number(yearMax) : null,
            status: status ? String(status).trim().toLowerCase() : null,
            priceMin: priceMin ? Number(priceMin) : null,
            priceMax: priceMax ? Number(priceMax) : null,
            sort: sort ? String(sort).trim() : null,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 20
        });

        return handerResponse(res, 200, 'Cars retrieved successfully', result);
    } catch (error) {
        if (error.message.includes('Invalid status') || error.message.includes('Invalid sort')) {
            return handerResponse(res, 400, error.message);
        }
        next(error);
    }
};