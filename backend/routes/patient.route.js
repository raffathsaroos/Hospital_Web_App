import express from "express";
import patientController from "../controllers/patient.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = express.Router();

// Only administrators mutate accounts; care staff receive read access.
router.use(authenticate);
router.post("/", authorize("Admin"), patientController.register);
router.get(
  "/",
  authorize("Admin", "Receptionist", "Doctor"),
  patientController.getAll,
);
router.get(
  "/:id",
  authorize("Admin", "Receptionist", "Doctor"),
  patientController.getById,
);
router.put("/:id", authorize("Admin"), patientController.update);
router.patch(
  "/:id/status",
  authorize("Admin"),
  patientController.setActiveStatus,
);

export default router;
