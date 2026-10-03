import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/db.js';
import { env } from '../../config/env.js';
import { RoleEnum, ShopCategoryType } from '../../config/constants.js';
import { ApiError } from '../../utils/ApiError.js';
import { OtpService } from './otp.service.js';

interface RegisterInput {
  ownerName: string;
  shopName: string;
  phoneNumber: string;
  password: string;
  shopCategory: ShopCategoryType;
  address?: string;
}

interface LoginInput {
  phoneNumber: string;
  password?: string;
  otp?: string;
}

export class AuthService {
  /**
   * Helper to generate Access and Refresh JWTs for shopkeeper
   */
  private static generateTokens(shop: {
    id: string;
    ownerName: string;
    shopName: string;
    phoneNumber: string;
    shopCategory: any;
  }) {
    const payload = {
      id: shop.id,
      ownerName: shop.ownerName,
      shopName: shop.shopName,
      phoneNumber: shop.phoneNumber,
      shopCategory: shop.shopCategory,
      role: RoleEnum.SHOP_OWNER,
    };

    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
    });

    const refreshToken = jwt.sign({ id: shop.id, role: RoleEnum.SHOP_OWNER }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    });

    return { accessToken, refreshToken };
  }

  /**
   * Register a new shopkeeper account
   */
  static async register(input: RegisterInput) {
    const existingShop = await prisma.shop.findUnique({
      where: { phoneNumber: input.phoneNumber },
    });

    if (existingShop) {
      throw ApiError.conflict('A shop with this phone number is already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const shop = await prisma.shop.create({
      data: {
        ownerName: input.ownerName,
        shopName: input.shopName,
        phoneNumber: input.phoneNumber,
        passwordHash,
        shopCategory: input.shopCategory as any,
        address: input.address,
      },
      select: {
        id: true,
        ownerName: true,
        shopName: true,
        phoneNumber: true,
        shopCategory: true,
        address: true,
        createdAt: true,
      },
    });

    const tokens = this.generateTokens(shop);

    return {
      shop,
      ...tokens,
    };
  }

  /**
   * Send OTP for phone-based login
   */
  static async sendOtp(phoneNumber: string) {
    const shop = await prisma.shop.findUnique({
      where: { phoneNumber },
    });

    if (!shop) {
      throw ApiError.notFound('No shop found registered with this phone number. Please register first.');
    }

    return await OtpService.sendOtp(phoneNumber);
  }

  /**
   * Login supporting both Password Mode and OTP Mode
   */
  static async login(input: LoginInput) {
    const shop = await prisma.shop.findUnique({
      where: { phoneNumber: input.phoneNumber },
    });

    if (!shop) {
      throw ApiError.unauthorized('Invalid phone number or account does not exist');
    }

    if (input.password) {
      // Mode 1: Password Login
      const isMatch = await bcrypt.compare(input.password, shop.passwordHash);
      if (!isMatch) {
        throw ApiError.unauthorized('Invalid phone number or password');
      }
    } else if (input.otp) {
      // Mode 2: OTP Login
      await OtpService.verifyOtp(input.phoneNumber, input.otp);
    } else {
      throw ApiError.badRequest('Please provide either password or OTP');
    }

    const tokens = this.generateTokens(shop);

    return {
      shop: {
        id: shop.id,
        ownerName: shop.ownerName,
        shopName: shop.shopName,
        phoneNumber: shop.phoneNumber,
        shopCategory: shop.shopCategory,
        address: shop.address,
      },
      ...tokens,
    };
  }

  /**
   * Refresh JWT access token using valid refresh token
   */
  static async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        id: string;
        role: string;
      };

      if (decoded.role !== RoleEnum.SHOP_OWNER) {
        throw ApiError.unauthorized('Invalid token role');
      }

      const shop = await prisma.shop.findUnique({
        where: { id: decoded.id },
      });

      if (!shop) {
        throw ApiError.unauthorized('Shop not found or account removed');
      }

      const tokens = this.generateTokens(shop);

      return tokens;
    } catch (error) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }
  }
}
