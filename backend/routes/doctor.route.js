import express from 'express';
import doctorController from '../controllers/doctor.controller.js';

const router = express.Router();

// Doctor directory routes support basic profile management.
router.get('/', doctorController.getAll);
router.post('/', doctorController.create);
router.get('/:id', doctorController.getById);
// Soft delete: this only deactivates the shared User account.
router.delete('/:id', doctorController.remove);

export default router;
