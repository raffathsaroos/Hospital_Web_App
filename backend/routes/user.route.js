import express from 'express';
import userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = express.Router();
router.post('/login', userController.login);
router.use('/users', authenticate, authorize('Admin'));
router.post('/users', userController.create);
router.get('/users', userController.getAll);
router.get('/users/:id', userController.getById);
router.put('/users/:id', userController.update);
router.patch('/users/:id/status', userController.setStatus);

export default router;
