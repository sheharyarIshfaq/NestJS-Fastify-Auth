import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/database/prisma.module';
import { UserModule } from 'src/user/user.module';

import { EncryptionUtil } from 'utils/encryption.utils';
import { AuthResolver } from './auth.resolver';
import { OtpUtil } from 'utils/otp.utils';
import { LocalStrategy } from './passport/local.strategy';
import { EmailService } from 'src/email/email.service';
import { EmailModule } from 'src/email/email.module';


@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    PrismaModule,
    UserModule,
    EmailModule
  ],
  providers: [
    AuthService,
    EncryptionUtil,
    OtpUtil,
    AuthResolver,
    LocalStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule { }
