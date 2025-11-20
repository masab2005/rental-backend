import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import pool from './config/db.js';
import errorHandling from './middlewares/errorHandler.js';
import createUserTable from './data/createUserTable.js';
import createStaffTable from './data/createStaffTable.js';
import createCustomerTable from './data/createCustomerTable.js';
import createCarsTable from './data/createCarsTable.js';
import carRoutes from './routes/carRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import createMaintenanceTable from './data/createMaintenanceTable.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());


//routes
app.use('/user', userRoutes);
app.use('/car', carRoutes);
app.use('/api', maintenanceRoutes);

app.use(errorHandling);

app.get('/', async(req, res) => {
    const result = await pool.query('SELECT current_database()');
  res.send(`Connected to database: ${result.rows[0].current_database}`);
});

createUserTable();
createStaffTable();
createCustomerTable();
createMaintenanceTable();
createCarsTable();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});