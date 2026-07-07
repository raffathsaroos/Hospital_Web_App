import express from "express";
import dashboardController from "../controllers/dashboard.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Every active account receives analytics scoped by the service to its role.
router.get(
  "/dashboard/analytics",
  authenticate,
  dashboardController.getAnalytics,
);

export default router;
