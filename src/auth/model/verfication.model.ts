import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class VerificationResponse {
  @Field()
  accessToken: string;

  @Field()
  message: string;
}