import { Args, Context, Mutation, Resolver } from "@nestjs/graphql";
import { RegisterUserDto } from "../auth/dto/register-user.dto";
import { User } from "src/user/model/user.model";
import { AuthService } from "./auth.service";
import { UseGuards } from "@nestjs/common";
import { LocalAuthGuard } from "src/common/guards/local.guard";
import { LoginResponse } from "./model/login.model";
import { AuthGuard } from "../common/guards/auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { ForgetPasswordResponse } from "./model/forgetPassword.model";
import { VerificationResponse } from "./model/verfication.model";
import { AuthResponse } from "./model/register.model";
import { AccessToken } from "./model/token.model";

@Resolver()
export class AuthResolver {
  constructor(private readonly AuthService: AuthService) { }

  @Mutation(() => AuthResponse)
  register(@Args('input') input: RegisterUserDto): Promise<AuthResponse> {
    return this.AuthService.register(input);
  }

  @UseGuards(LocalAuthGuard)
  @Mutation(() => LoginResponse)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
    @Context() context: { req: { user: AuthResponse } },
  ): Promise<LoginResponse> {
    const { user, session } = context.req.user;
    const code = await this.AuthService.sendOtp(user.id,user.email);

    return {
      user,
      session,
      code,
    };
  }

  @Mutation(() => ForgetPasswordResponse)
  async forgetPassword(@Args('email') email: string): Promise<ForgetPasswordResponse> {
    return this.AuthService.forgetPassword(email);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => AuthResponse)
  async VerifyOtp(@CurrentUser() user: User, @Args('code') code: string): Promise<AuthResponse> {
    return await this.AuthService.verifyOtp(code, user);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => String)
  async changePassword(@CurrentUser() user: User, @Args('password') password: string): Promise<string> {
    return await this.AuthService.changePassword(password, user.id);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => AccessToken)
  async refreshToken(@CurrentUser() user: User,@Args('refreshToken') token:string): Promise<AccessToken> {
    return await this.AuthService.refreshToken(user,token);
  }
}
