import express from 'express';
import doctorController from '../controllers/doctor.controller.js';

const router = express.Router();

// Doctor directory routes support basic profile management.
router.get('/', doctorController.getAll);
router.post('/', doctorController.create);
router.get('/:id', doctorController.getById);
router.put('/:id', doctorController.update);
router.patch('/:id/status', doctorController.setActiveStatus);
// Soft delete: this only deactivates the shared User account.
router.delete('/:id', doctorController.remove);

export default router;
