import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "src/user/model/user.model";
import { AuthResponse } from "./register.model";

@ObjectType()
export class LoginResponse extends AuthResponse{
  
  @Field()
  code: string;

}