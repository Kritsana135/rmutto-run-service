import {Field, InputType, ObjectType} from "type-graphql";
import {IsEmail, Length} from "class-validator";
import {BaseResponse} from "../../../global/types";
import {User} from "../../../entity/User";
import {IsEmailAlreadyExist} from "./UserDecorator";
import {AuthMessage} from "../../../global/errorMessage";

@InputType()
export class SignupInput {
    @Field()
    @IsEmail()
    @IsEmailAlreadyExist({ message: AuthMessage.ALREADY_EMAIL })
    email: string;

    @Field()
    @Length(8,50)
    password: string;

    @Field()
    @Length(2,50)
    firstName: string;

    @Field()
    @Length(2,50)
    lastName: string;

    @Field()
    @Length(9,15)
    phoneNumber: string;

    @Field()
    address: string
}

@ObjectType()
export class CreateUserRes extends BaseResponse {

    @Field({nullable: true})
    user?: User
}

@InputType()
export class LoginInput {
    @Field()
    @IsEmail()
    email: string

    @Field()
    @Length(8,50)
    password: string
}

@ObjectType()
export class LoginRes  {

    @Field({nullable: true})
    accessToken?: string
}

@InputType()
export class ResetPassEmailInput {
    @Field()
    @IsEmail()
    email: string
}

@InputType()
export class ResetPassInput {
    @Field()
    @Length(8,50)
    newPass: string;

    @Field()
    token: string
}

