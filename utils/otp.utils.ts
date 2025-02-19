import { Injectable } from '@nestjs/common';

@Injectable()
export class OtpUtil {
  generateOtp(expiryTime: number = 5 * 60 * 1000): { code: string, expireDate?: Date } {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); 
    const expireDate = new Date(new Date().getTime() + expiryTime); 
    return { code, expireDate };  
  }
  
  // Check if OTP has expired
  isExpired(createdAt: Date, expiryTime: number = 5 * 60 * 1000): boolean {
    const currentTime = new Date().getTime();
    const otpCreationTime = new Date(createdAt).getTime();
    return currentTime - otpCreationTime > expiryTime;  
  }
}
