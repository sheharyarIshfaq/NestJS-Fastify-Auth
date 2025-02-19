import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Provider } from '@prisma/client';
import { EncryptionUtil } from 'utils/encryption.utils';
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';
import { OtpUtil } from 'utils/otp.utils';
import { JwtService } from '@nestjs/jwt';
import { ForgetPasswordResponse } from './model/forgetPassword.model';
import { User } from 'src/user/model/user.model';

// import { VerificationResponse } from './model/verfication.model';
import { AuthResponse } from './model/register.model';
import { AccessToken } from './model/token.model';
import { EmailService } from 'src/email/email.service';


@Injectable()
export class AuthService {
  constructor(
    private readonly PrismaService: PrismaService,
    private readonly encryptionUtil: EncryptionUtil,
    private readonly otpUtil: OtpUtil,
    private readonly jwtService: JwtService,

    private readonly emailService: EmailService,

  ) { }

  async login(email: string, password: string): Promise<AuthResponse | null> {
    const user = await this.PrismaService.user.findUnique({ where: { email } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await this.encryptionUtil.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    const token = await this.createSession(user);
    return { user, session: token };
  }

  async register(input: RegisterUserDto): Promise<AuthResponse | null> {
    const user = await this.PrismaService.user.findUnique({ where: { email: input.email } });

    if (user) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await this.hashPassword(input.password);
    const newUser = await this.PrismaService.user.create({
      data: { ...input, password: hashedPassword, provider: Provider.EMAIL },
    });

    const token = await this.createSession(newUser);

    return { user: newUser, session: token };
  }

  async sendOtp(userId: number,email:string): Promise<string> {

    const { code, expireDate } = this.otpUtil.generateOtp();
    await this.PrismaService.otp.create({
      data: { code, expiresAt: expireDate, userId },
    });


      await this.emailService.sendEmail({
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP is ${code}`
      });
  

    return code;
  }

  async forgetPassword(email: string): Promise<ForgetPasswordResponse> {
    const user = await this.PrismaService.user.findUnique({ where: { email } });

    if (!user) {
      throw new BadRequestException('User not found');
    }


    const code = await this.sendOtp(user.id,email);


    const session = await this.createSession(user);

    return { code, session, user };
  }

  async verifyOtp(otp: string, user: User): Promise<AuthResponse> {
    const verification = await this.PrismaService.otp.findFirst({
      where: { userId: user.id, code: otp },
    });

    if (!verification || this.otpUtil.isExpired(verification.createdAt)) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.PrismaService.otp.delete({ where: { id: verification.id } });
    const session = await this.createSession(user);

    return { session, user };
  }

  async changePassword(password: string, userId: number): Promise<string> {
    const hashedPassword = await this.hashPassword(password);
    await this.PrismaService.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return 'Password changed successfully';
  }

  async refreshToken(user:User,token:string): Promise<AccessToken> {

    const isTokenExist = await this.PrismaService.session.findUnique({
      where: {token},
    });

    if(!isTokenExist){
      throw new BadRequestException('Invalid refresh token');
    }

    return this.createSession(user);
  }

  // 🚀 ----------------- Private Helper Methods ----------------- 🚀

  private generateToken(payload: Record<string, any>, expiresIn: string): string {
    return this.jwtService.sign(payload, { expiresIn });
  }

  private async createSession(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.generateToken({ id: user.id, email: user.email, role: user.role }, '15m');
    const refreshToken = this.generateToken({ id: user.id }, '7d'); // 7 days for refresh token

    await this.PrismaService.session.deleteMany({
      where: { userId: user.id },
    });
    
    await this.PrismaService.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), 

      },
    });

    return { accessToken, refreshToken };
  }

  private async hashPassword(password: string): Promise<string> {
    const hashedPassword = await this.encryptionUtil.hashPassword(password);
    if (!hashedPassword) {
      throw new BadRequestException('Password hashing failed');
    }
    return hashedPassword;
  }

}
