import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/database/prisma.service';
import { User } from 'src/user/model/user.model';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { authorization } = ctx.getContext().req.headers;

    if (!authorization) throw new UnauthorizedException('No token provided');
    
    try {
      const token = authorization.split(' ')[1]; 
      const decoded:Partial<User> = this.jwtService.verify(token);

      const user = await this.prismaService.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      ctx.getContext().req.user = user;
      
      return true;
    } catch (error) {
      console.log("ERROR 🚀 ->", error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}