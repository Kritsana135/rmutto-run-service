import { IsEmail, Length } from "class-validator";
import { Field, InputType, ObjectType } from "type-graphql";
import { User } from "../../../entity/User";
import BaseResponse from "../../../global/types";

@InputType()
export class SignupInput {
  @Field()
  @Length(2, 30)
  firstName: string;

  @Field()
  @Length(2, 30)
  lastName: string;

  @Field()
  address: string;

  @Field()
  @Length(9, 15)
  phoneNumber: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @Length(8, 30)
  password: string;
}

export const CreateUserRes = BaseResponse(User);
export type CreateUserRes = InstanceType<typeof CreateUserRes>;

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @Length(8, 50)
  password: string;
}

@ObjectType()
export class Token {
  @Field({ nullable: true })
  accessToken?: string;

  @Field()
  userId?: string;
}

export const LoginRes = BaseResponse(Token);
export type LoginRes = InstanceType<typeof LoginRes>;

@InputType()
export class ResetPassEmailInput {
  @Field()
  @IsEmail()
  email: string;
}

@InputType()
export class ResetPassInput {
  @Field()
  @Length(8, 50)
  newPass: string;

  @Field()
  token: string;
}
