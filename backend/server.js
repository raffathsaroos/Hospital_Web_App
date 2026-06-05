import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/user.route.js';
import patientRoutes from './routes/patient.route.js';

dotenv.config();

const app = express();

// Read JSON requests and allow the frontend to call this API.
app.use(cors());
app.use(express.json());

// Use the local hospital database when no environment URL is provided.
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_db';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('DB Connection Error:', error));

// API routes pass requests through controllers, services, and DAOs.
app.use('/api', userRoutes);
app.use('/api/patients', patientRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
