import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/user.route.js";
import patientRoutes from "./routes/patient.route.js";
import appointmentRoutes from "./routes/appointment.route.js";
import doctorRoutes from "./routes/doctor.route.js";
import clinicalRoutes from "./routes/clinical.route.js";
import dashboardRoutes from "./routes/dashboard.route.js";
import Appointment from "./models/appointment.model.js";

const app = express();

// Read JSON requests and allow the frontend to call this API.
app.use(cors());
app.use(express.json());

const LOCAL_MONGO_URI = "mongodb://127.0.0.1:27017/hospital_db";

mongoose
  .connect(LOCAL_MONGO_URI)
  .then(async () => {
    // Removes obsolete indexes and applies the current 10-patient slot indexes.
    await Appointment.syncIndexes();
    console.log("Connected to local MongoDB");
  })
  .catch((error) => console.error("DB Connection Error:", error));

// API routes pass requests through controllers, services, and DAOs.
app.use("/api", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api", clinicalRoutes);
app.use("/api", dashboardRoutes);

// Consistent response for unknown API endpoints.
app.use("/api", (_req, res) =>
  res.status(404).json({ message: "API endpoint not found." }),
);

// Keeps unexpected asynchronous errors from leaking implementation details.
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
