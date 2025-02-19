import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from 'src/user/model/user.model';
import { AuthResponse } from '../model/register.model';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' }); // Specify the field for the username in the request body (default is 'username') 
  }

  async validate(email: string, password: string): Promise<AuthResponse> {
    const response = await this.authService.login(email, password);
    return response;
  }
}
