import express from 'express';
import appointmentController from '../controllers/appointment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = express.Router();

const appointmentReaders = [
  'Admin',
  'Receptionist',
  'Doctor',
  'Patient',
];

// Guest booking stays public; every management action is authenticated.
router.post('/public', appointmentController.createPublic);
router.post(
  '/',
  authenticate,
  authorize('Admin', 'Receptionist'),
  appointmentController.createByStaff
);
router.get(
  '/',
  authenticate,
  authorize(...appointmentReaders),
  appointmentController.getAll
);
router.get(
  '/:id',
  authenticate,
  authorize(...appointmentReaders),
  appointmentController.getById
);
router.put(
  '/:id',
  authenticate,
  authorize('Admin', 'Receptionist'),
  appointmentController.reschedule
);
router.patch(
  '/:id/status',
  authenticate,
  authorize(...appointmentReaders),
  appointmentController.updateStatus
);

export default router;
