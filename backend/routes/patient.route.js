import express from 'express';
import patientController from '../controllers/patient.controller.js';

const router = express.Router();

// Patient registration and management endpoints.
router.post('/', patientController.register);
router.get('/', patientController.getAll);
router.get('/:id', patientController.getById);
router.put('/:id', patientController.update);
router.patch('/:id/status', patientController.setActiveStatus);
router.delete('/:id', patientController.remove);

export default router;
