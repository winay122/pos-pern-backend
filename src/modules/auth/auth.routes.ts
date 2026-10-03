import { Router } from 'express';
import { register, sendOtp, login, refreshToken, logout } from './auth.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authLimiter, otpLimiter } from '../../middleware/rateLimiter.middleware.js';
import { registerSchema, sendOtpSchema, loginSchema, refreshTokenSchema } from './auth.validation.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/send-otp', otpLimiter, validate(sendOtpSchema), sendOtp);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);
router.post('/logout', logout);

export default router;
