import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "src/user/model/user.model";
import { AccessToken } from "./token.model";

@ObjectType()
export class AuthResponse {
  @Field(() => User)
  user: User;

  @Field(() => AccessToken)
  session:AccessToken

  @Field(() => String,{nullable:true})
  code?: string;

}