import crypto from 'crypto';

/**
 * Generates a unique barcode value for repacked or unbranded products.
 * Format: [PREFIX 2 digits][TIMESTAMP last 6 digits][RANDOM 4 digits] -> 12 digits numeric string
 * Compatible with standard Code128 / EAN-13 barcodes.
 */
export function generateBarcode(prefix: string = '89'): string {
  const timeSlice = Date.now().toString().slice(-6);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
  return `${prefix}${timeSlice}${randomSuffix}`;
}

/**
 * Generates a unique 6-digit numeric OTP.
 */
export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}
