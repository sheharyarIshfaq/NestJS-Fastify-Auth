import { ObjectType, Field } from '@nestjs/graphql';
import { AuthResponse } from './register.model';

@ObjectType()
export class ForgetPasswordResponse extends AuthResponse {
  
  @Field()
  code: string;
}