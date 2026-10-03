import { Role, ShopCategory } from '@prisma/client';

export interface AuthenticatedShop {
  id: string;
  ownerName: string;
  shopName: string;
  phoneNumber: string;
  shopCategory: ShopCategory;
  role: Role;
}

export interface AuthenticatedAdmin {
  id: string;
  name: string;
  email: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      shop?: AuthenticatedShop;
      admin?: AuthenticatedAdmin;
      user?: AuthenticatedShop | AuthenticatedAdmin;
    }
  }
}
