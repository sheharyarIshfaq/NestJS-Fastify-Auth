import { Args, Int, Mutation, Query } from "@nestjs/graphql"
import { Resolver } from "@nestjs/graphql"
import { UpdateUserInput, User } from "./model/user.model";
import { UserService } from "./user.service";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/common/guards/auth.guard";
import { RolesGuard } from "src/common/guards/role.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { Role } from "@prisma/client";

@UseGuards(AuthGuard,RolesGuard)
@Resolver()
export class UserResolver {
    
    constructor(
        private readonly UserService: UserService
    ) {}

    @Query(() => [User])
    @Roles(Role.ADMIN)
     getUsers() {
        const response = this.UserService.getUsers();
        return response;
    }

    @Query(() => User)
    @Roles(...Object.values(Role))
    getUserById(@Args('id',{type: ()=> Int}) id: number) {
        const response = this.UserService.getUserById(id);
        return response;
    }

    @Mutation(() => User)
    @Roles(...Object.values(Role))
    updateUser(@Args('user') user: UpdateUserInput) {
        return this.UserService.updateUser(user);
    }
}
