import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { Provider, Role } from "@prisma/client";
import { IsOptional, IsString, IsPhoneNumber, IsEmail, Length } from 'class-validator';

@ObjectType()
export class User {

    @Field(() => Int) // To convert the type number to int otherwise it will convert it into float    
    id: number;

    @Field()
    fullname: string;

    @Field()
    email: string;

    @Field()
    password: string;

    @Field()
    role: Role;

    @Field({nullable:true})
    profilePicture?:string

    @Field({nullable:true})
    phone: string;

    @Field({nullable:true})
    address:string;

    @Field()
    provider: Provider;
    
    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}

@InputType()
export class UpdateUserInput {

    @Field(() => Int)
    @IsOptional()
    id: number;

    @Field({ nullable: true })
    @IsOptional() 
    @IsString()
    @Length(2, 100)
    fullname?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsPhoneNumber(null)
    phone?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    address?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    profilePicture?: string;
}