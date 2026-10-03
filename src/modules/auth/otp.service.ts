import bcrypt from 'bcryptjs';
import { prisma } from '../../config/db.js';
import { generateOtp } from '../../utils/barcodeGenerator.js';
import { logger } from '../../utils/logger.js';
import { OTP_CONFIG } from '../../config/constants.js';
import { ApiError } from '../../utils/ApiError.js';

export class OtpService {
  static async sendOtp(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);

    await prisma.otpRequest.create({
      data: {
        phoneNumber,
        otpHash,
        expiresAt,
        verified: false,
      },
    });

    logger.info(`🔑 [OTP SERVICE] OTP for ${phoneNumber}: ${otp} (Valid for ${OTP_CONFIG.EXPIRY_MINUTES} mins)`);

    return {
      success: true,
      message: `OTP sent successfully to ${phoneNumber}`,
    };
  }

  static async verifyOtp(phoneNumber: string, otp: string): Promise<boolean> {
    const latestOtpRecord = await prisma.otpRequest.findFirst({
      where: {
        phoneNumber,
        verified: false,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!latestOtpRecord) {
      throw new ApiError(400, 'Invalid or expired OTP. Please request a new one.');
    }

    const isMatch = await bcrypt.compare(otp, latestOtpRecord.otpHash);
    if (!isMatch) {
      throw new ApiError(400, 'Invalid OTP entered.');
    }

    await prisma.otpRequest.update({
      where: { id: latestOtpRecord.id },
      data: { verified: true },
    });

    return true;
  }
}
