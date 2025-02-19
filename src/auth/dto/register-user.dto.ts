import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength } from 'class-validator';

@InputType()
export class RegisterUserDto {
    @Field()
    @IsString()
    @MinLength(4)
    fullname: string;

    @Field()
    @IsEmail()
    email: string;

    @Field()
    @IsString()
    @MinLength(6)
    password: string;
}
