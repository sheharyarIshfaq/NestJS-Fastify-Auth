import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Provider } from '@prisma/client';
import { Strategy } from 'passport-facebook';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly prismaService: PrismaService) {
    super({
      clientID: process.env.FACEBOOK_APP_ID as string,
      clientSecret: process.env.FACEBOOK_APP_SECRET as string,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL as string,
      profileFields: ['id', 'emails', 'name'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { id, emails, name } = profile;
    const email = emails?.[0]?.value;

    if (!email) {
      throw new Error('Facebook account does not provide an email');
    }

    let user = await this.prismaService.user.findUnique({
      where: { email }, // TODO i think facebook policy is recently changed, so we can't get email anymore from facebook just like in apple login
    }); // TODO so we need to find user by socialAuth if that's the case

    if (!user) {
      const fullname = `${name.givenName} ${name.familyName}`;
      user = await this.prismaService.user.create({
        data: {
          email,
          socialAuth: id,
          fullname,
          provider: Provider.FACEBOOK,
        },
      });
    }

    return user;
  }
}
