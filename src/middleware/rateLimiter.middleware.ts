import rateLimit from 'express-rate-limit';

// Standard rate limiter for general API routes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    errors: ['Rate limit exceeded'],
  },
});

// Stricter rate limiter for auth & OTP endpoints to prevent brute-force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 auth requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again in a few minutes.',
    errors: ['Auth rate limit exceeded'],
  },
});

export const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Limit OTP requests to 5 per 5 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP requests. Please wait 5 minutes before trying again.',
    errors: ['OTP rate limit exceeded'],
  },
});
