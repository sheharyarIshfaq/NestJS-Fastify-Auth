import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UpdateUserInput, User } from './model/user.model';

@Injectable()
export class UserService {

  constructor(
    private readonly prismaService: PrismaService,
  ) { }

  async getUsers(): Promise<User[]> {
    const users = await this.prismaService.user.findMany();
    return users;
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: id,
      },
    });
    return user;
  }

  async updateUser(user: UpdateUserInput): Promise<User> {
    
    const isUserExist = await this.prismaService.user.findUnique({  
      where: {
        id: user.id,
      },
    });

    if (!isUserExist) {
      throw new Error('User not found')
    }

    const updatedUser = await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: user
    });

    return updatedUser;
  }
}
