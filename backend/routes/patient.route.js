import express from 'express';
import patientController from '../controllers/patient.controller.js';

const router = express.Router();

router.post('/patients', patientController.createPatient);
router.get('/patients', patientController.getPatients);
router.get('/patients/:id', patientController.getPatientById);
router.put('/patients/:id', patientController.updatePatient);
router.delete('/patients/:id', patientController.deletePatient);

export default router;
