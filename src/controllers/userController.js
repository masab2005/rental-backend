import { 
    createUserAndProfileService, 
    getUserByNameService,
} from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const handerResponse = (res,status, message, data = null) => {
    res.status(status).json({
        status,
        message,
        data
    });
}

export const createUser = async (req, res, next) => {
  const { username, password, role, secretKey, name, phone, driverLicense } = req.body;

  try {
    // Basic validation
    if (!username || !password || !role || !name || !phone) {
      return res.status(400).json({ error: "username, password, role, name and phone are required" });
    }

    if (!["customer", "staff"].includes(role)) {
      return res.status(400).json({ error: "Role must be 'customer' or 'staff'" });
    }

    if (role === "staff" && secretKey !== process.env.STAFF_SECRET_KEY) {
      return res.status(403).json({ error: "Invalid staff secret key" });
    }

    // Validate phone shape (11 digits)
    if (!/^[0-9]{11}$/.test(phone)) {
      return res.status(400).json({ error: "phone must be exactly 11 digits" });
    }

    // driverLicense required for customer
    if (role === "customer" && (!driverLicense || driverLicense.length > 20)) {
      return res.status(400).json({ error: "driverLicense is required for customers and max 20 chars" });
    }

    const result = await createUserAndProfileService({
      username,
      password,
      role,
      name,
      phone,
      driverLicense: driverLicense ?? null,
    });
    return handerResponse(res, 201, "User and profile created successfully", result);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Duplicate value. Possibly username, phone or driver license already exists." });
    }
    // Unexpected
    next(err);
  }
};

export const loginUser = async (req,res,next) => {
    const { username, password, role } = req.body;

  try {
    const user = await getUserByNameService(username,role);

    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

 
    const token = jwt.sign(
      {
        id: user.userid,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role
    });
  } catch (err) {
    next(err);
  }
}
export const getAllUsers = async(req, res, next) => {
    try {
        const users = await getAllUsersService();
        handerResponse(res, 200, 'Users retrieved successfully', users);
    } catch (error) {
        next(error);
    }           
}

export const getUserById = async(req, res, next) => {  
    const { id } = req.params;
    try {
        const user = await getUserByIdService(id);
        if (!user) {
            return handerResponse(res, 404, 'User not found');
        }
        handerResponse(res, 200, 'User retrieved successfully', user);
    }
    catch (error) {
        next(error);
    }       
}
export const updateUser = async(req, res, next) => {
    const { id } = req.params;
    const { name, email } = req.body;
    try {
        const updatedUser = await updateUserService(id, name, email);
        if (!updatedUser) {
            return handerResponse(res, 404, 'User not found');
        }
        handerResponse(res, 200, 'User updated successfully', updatedUser);
    } catch (error) {
        next(error);
    }   
}
export const deleteUser = async(req, res, next) => {
    const { id } = req.params;
    try {
        const deletedUser = await deleteUserService(id);        
        if (!deletedUser) {
            return handerResponse(res, 404, 'User not found');
        }
        handerResponse(res, 200, 'User deleted successfully', deletedUser);
    } catch (error) {
        next(error);
    }
}