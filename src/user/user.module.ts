import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { PrismaModule } from 'src/database/prisma.module';
import { EncryptionUtil } from 'utils/encryption.utils';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    
  ],
  providers: [
    UserService,
    UserResolver,
    EncryptionUtil,
  ],
  exports: [UserService],
})
export class UserModule { }
