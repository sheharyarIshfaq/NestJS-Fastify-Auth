import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Provider } from '@prisma/client';
import { Strategy } from 'passport-google-oauth20';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly prismaService: PrismaService, 
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { email, id, displayName } = profile;

    let user = await this.prismaService.user.findUnique({
      where: { email }, 
    });

    if (!user) {
      user = await this.prismaService.user.create({
        data: {
          email, 
          socialAuth: id, 
          fullname: displayName, 
          provider: Provider.GOOGLE
        },
      });
    }

    return user;
  }
}
