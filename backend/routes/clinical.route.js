import express from "express";
import clinicalController from "../controllers/clinical.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = express.Router();
router.use(authenticate);

router.post(
  "/diagnoses",
  authorize("Doctor"),
  clinicalController.createDiagnosis,
);
router.post(
  "/prescriptions",
  authorize("Doctor"),
  clinicalController.createPrescription,
);
router.get(
  "/prescriptions",
  authorize("Admin", "Doctor", "Pharmacist", "Patient"),
  clinicalController.listPrescriptions,
);
router.patch(
  "/prescriptions/:id/dispense",
  authorize("Pharmacist"),
  clinicalController.dispensePrescription,
);

router.post(
  "/lab-requests",
  authorize("Doctor"),
  clinicalController.createLabRequest,
);
router.get(
  "/lab-requests",
  authorize("Admin", "Doctor", "Lab Operator", "Patient"),
  clinicalController.listLabRequests,
);
router.patch(
  "/lab-requests/:id/complete",
  authorize("Lab Operator"),
  clinicalController.completeLabRequest,
);

router.post(
  "/radiology-requests",
  authorize("Doctor"),
  clinicalController.createRadiologyRequest,
);
router.get(
  "/radiology-requests",
  authorize("Admin", "Doctor", "Radiologist", "Patient"),
  clinicalController.listRadiologyRequests,
);
router.patch(
  "/radiology-requests/:id/complete",
  authorize("Radiologist"),
  clinicalController.completeRadiologyRequest,
);

router.get(
  "/reports",
  authorize("Admin", "Doctor", "Patient"),
  clinicalController.getReports,
);

export default router;
