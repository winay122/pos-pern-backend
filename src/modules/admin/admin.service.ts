import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/db.js';
import { env } from '../../config/env.js';
import { RoleEnum } from '../../config/constants.js';
import { ApiError } from '../../utils/ApiError.js';
import { ShopService, CreateShopInput } from '../shop/shop.service.js';

export class AdminService {
  /**
   * Ensure initial admin exists if Admin table is empty
   */
  private static async ensureInitialAdmin() {
    const count = await prisma.admin.count();
    if (count === 0) {
      const passwordHash = await bcrypt.hash(env.ADMIN_INITIAL_PASSWORD, 10);
      await prisma.admin.create({
        data: {
          name: 'Platform Administrator',
          email: env.ADMIN_INITIAL_EMAIL,
          passwordHash,
        },
      });
    }
  }

  /**
   * Admin Login (email + password only)
   */
  static async login(email: string, password: string) {
    await this.ensureInitialAdmin();

    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!admin) {
      throw ApiError.unauthorized('Invalid admin email or password');
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid admin email or password');
    }

    const payload = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: RoleEnum.ADMIN,
    };

    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
    });

    return {
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: RoleEnum.ADMIN,
      },
      accessToken,
    };
  }

  /**
   * Admin creates a shop manually on behalf of shopkeeper
   */
  static async createShop(input: CreateShopInput) {
    return await ShopService.createShop(input);
  }

  /**
   * List all registered shops with pagination and count metrics
   */
  static async listShops(params: { search?: string; category?: string; page?: number; limit?: number }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.category && params.category !== 'ALL') {
      where.shopCategory = params.category;
    }

    if (params.search) {
      where.OR = [
        { shopName: { contains: params.search, mode: 'insensitive' } },
        { ownerName: { contains: params.search, mode: 'insensitive' } },
        { phoneNumber: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [shops, total] = await Promise.all([
      prisma.shop.findMany({
        where,
        select: {
          id: true,
          ownerName: true,
          shopName: true,
          phoneNumber: true,
          shopCategory: true,
          address: true,
          createdAt: true,
          _count: {
            select: {
              products: true,
              sales: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.shop.count({ where }),
    ]);

    return {
      shops,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Platform level overview statistics
   */
  static async getPlatformStats() {
    const [totalShops, totalProducts, totalSales, salesAgg] = await Promise.all([
      prisma.shop.count(),
      prisma.product.count(),
      prisma.sale.count(),
      prisma.sale.aggregate({
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    return {
      totalShops,
      totalProducts,
      totalSalesCount: totalSales,
      totalSalesVolume: salesAgg._sum.totalAmount || 0,
    };
  }
}
