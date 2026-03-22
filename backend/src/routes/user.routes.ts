// ============================================================
// src/routes/user.routes.ts
// ============================================================
import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { validate } from '../middleware/validate';
import { registrationLimiter } from '../middleware/rateLimiter';
import {
    registerUserSchema,
    updateUserSchema,
    userIdParamSchema,
} from '../schemas/user.schema';

const router = Router();

// POST /api/v1/users — register / upsert user (no OTP, phone = identity)
router.post('/', registrationLimiter, validate(registerUserSchema), userController.registerUser);

// GET /api/v1/users/phone/:phone — check if a user is already registered with this phone number
router.get('/phone/:phone', userController.getUserByPhoneHandler);

// GET /api/v1/users/:id — get full user profile
router.get('/:id', validate(userIdParamSchema, 'params'), userController.getUser);

// PATCH /api/v1/users/:id — update preferences / profile
router.patch(
    '/:id',
    validate(userIdParamSchema, 'params'),
    validate(updateUserSchema),
    userController.updateUser
);

// GET /api/v1/users/:id/exams — personalized exam list
router.get('/:id/exams', validate(userIdParamSchema, 'params'), userController.getUserExams);

// POST /api/v1/users/:id/saved-exams — toggle bookmark on an exam
router.post('/:id/saved-exams', validate(userIdParamSchema, 'params'), userController.toggleSavedExam);

// GET /api/v1/users/:id/notifications — user notification inbox
router.get('/:id/notifications', validate(userIdParamSchema, 'params'), userController.getUserNotifications);

export { router as userRouter };
