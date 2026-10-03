import bcrypt from 'bcryptjs';
import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { ShopCategoryType } from '../../config/constants.js';

export interface CreateShopInput {
  ownerName: string;
  shopName: string;
  phoneNumber: string;
  password?: string;
  shopCategory?: ShopCategoryType;
  address?: string;
}

export class ShopService {
  /**
   * Get profile of the current authenticated shop
   */
  static async getShopProfile(shopId: string) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
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
    });

    if (!shop) {
      throw ApiError.notFound('Shop not found');
    }

    return shop;
  }

  /**
   * Update shop profile
   */
  static async updateShopProfile(
    shopId: string,
    data: {
      ownerName?: string;
      shopName?: string;
      shopCategory?: ShopCategoryType;
      address?: string;
    }
  ) {
    const updated = await prisma.shop.update({
      where: { id: shopId },
      data: {
        ...(data.ownerName && { ownerName: data.ownerName }),
        ...(data.shopName && { shopName: data.shopName }),
        ...(data.shopCategory && { shopCategory: data.shopCategory as any }),
        ...(data.address !== undefined && { address: data.address }),
      },
      select: {
        id: true,
        ownerName: true,
        shopName: true,
        phoneNumber: true,
        shopCategory: true,
        address: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  /**
   * Reusable shop creation logic (used by both self-registration and admin shop creation)
   */
  static async createShop(input: CreateShopInput) {
    const existing = await prisma.shop.findUnique({
      where: { phoneNumber: input.phoneNumber },
    });

    if (existing) {
      throw ApiError.conflict('Shop with this phone number already exists');
    }

    const defaultPassword = input.password || 'Shop@1234';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const shop = await prisma.shop.create({
      data: {
        ownerName: input.ownerName,
        shopName: input.shopName,
        phoneNumber: input.phoneNumber,
        passwordHash,
        shopCategory: (input.shopCategory as any) || 'GENERAL_STORE',
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

    return shop;
  }
}
