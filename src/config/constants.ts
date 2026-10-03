export const ShopCategoryEnum = {
  GENERAL_STORE: 'GENERAL_STORE',
  CLOTH: 'CLOTH',
  COSMETICS: 'COSMETICS',
  OTHER: 'OTHER',
} as const;

export type ShopCategoryType = keyof typeof ShopCategoryEnum;

export const UnitTypeEnum = {
  PIECE: 'PIECE',
  KG: 'KG',
  GRAM: 'GRAM',
  LITER: 'LITER',
  ML: 'ML',
  DOZEN: 'DOZEN',
  LOT: 'LOT',
  QUINTAL: 'QUINTAL',
  BAG: 'BAG',
  TEN_PIECE: 'TEN_PIECE',
} as const;

export type UnitTypeValue = keyof typeof UnitTypeEnum;

export const SyncStatusEnum = {
  SYNCED: 'SYNCED',
  PENDING: 'PENDING',
} as const;

export const PaymentModeEnum = {
  CASH: 'CASH',
  UPI: 'UPI',
  CREDIT: 'CREDIT',
  OTHER: 'OTHER',
} as const;

export const RoleEnum = {
  SHOP_OWNER: 'SHOP_OWNER',
  ADMIN: 'ADMIN',
} as const;

export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 5,
  RESEND_COOLDOWN_SECONDS: 30,
};

export const DEFAULT_CORS_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

