import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { RoleEnum } from '../config/constants.js';
import { AuthenticatedShop, AuthenticatedAdmin } from '../types/express.js';

interface JwtPayload {
  id: string;
  role: 'SHOP_OWNER' | 'ADMIN';
  ownerName?: string;
  shopName?: string;
  phoneNumber?: string;
  shopCategory?: any;
  email?: string;
  name?: string;
}

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication token required'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

    if (decoded.role === RoleEnum.ADMIN) {
      req.admin = {
        id: decoded.id,
        name: decoded.name || 'Admin',
        email: decoded.email || '',
        role: decoded.role,
      };
      req.user = req.admin;
    } else {
      req.shop = {
        id: decoded.id,
        ownerName: decoded.ownerName || '',
        shopName: decoded.shopName || '',
        phoneNumber: decoded.phoneNumber || '',
        shopCategory: decoded.shopCategory || 'GENERAL_STORE',
        role: decoded.role || RoleEnum.SHOP_OWNER,
      };
      req.user = req.shop;
    }

    next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid or expired authentication token'));
  }
};

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  authenticate(req, _res, (err?: any) => {
    if (err) return next(err);

    if (!req.admin || req.admin.role !== RoleEnum.ADMIN) {
      return next(new ApiError(403, 'Forbidden: Admin access required'));
    }

    next();
  });
};

export const requireShop = (req: Request, _res: Response, next: NextFunction) => {
  authenticate(req, _res, (err?: any) => {
    if (err) return next(err);

    if (!req.shop) {
      return next(new ApiError(403, 'Forbidden: Shopkeeper access required'));
    }

    next();
  });
};
