import express from 'express';
import doctorController from '../controllers/doctor.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = express.Router();

// Doctor directory routes support basic profile management.
router.get('/', doctorController.getAll);
router.get('/admin/all', authenticate, authorize('Admin'), doctorController.getAllForAdmin);
router.get('/admin/:id', authenticate, authorize('Admin'), doctorController.getByIdForAdmin);
router.get('/:id', doctorController.getById);
router.use(authenticate, authorize('Admin'));
router.post('/', doctorController.create);
router.put('/:id', doctorController.update);
router.patch('/:id/status', doctorController.setActiveStatus);
// Soft delete: this only deactivates the shared User account.
router.delete('/:id', doctorController.remove);

export default router;
