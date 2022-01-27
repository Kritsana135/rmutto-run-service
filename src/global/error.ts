import { Field, ObjectType } from "type-graphql";
import { IKeyPairsError } from "./interface";

export const AuthMessage = {
  USER_NOT_FOUND: "could not find user",
  INVALID_PASSWORD: "password is invalid",
  ALREADY_EMAIL: "this email has been signup",
  USER_NOT_VERIFY: "this user not verify",
  NOT_AUTH: "NOT_AUTH",
  TOKEN_EXPIRE: "TOKEN_EXPIRE",
};

export const AuthMessage2 = {
  TOKEN_NOT_FOUND: {
    key: "TOKEN_NOT_FOUND",
    message: "token not found.",
  },
  USER_NOT_FOUND: {
    key: "USER_NOT_FOUND",
    message: "ไม่พบผู้ใช้งานในระบบ",
  },
  NOT_AUTH: {
    key: "NOT_AUTH",
    message: "not authenticated",
  },
  USER_NOT_VERIFY: {
    key: "USER_NOT_VERIFY",
    message: "ผู้ใช้ยังไม่ได้ทำการยืนยันอีเมล",
  },
  INVALID_PASSWORD: {
    key: "INVALID_PASSWORD",
    message: "รหัสผ่านไม่ถูกต้อง",
  },
  UPLOAD_FAIL: {
    key: "UPLOAD_FAIL",
    message: "upload image fail!",
  },
  ALREADY_EMAIL: {
    key: "ALREADY_EMAIL",
    message: "this email has been signup",
  },
  CREATE_USER_FAIL: {
    key: "CREATE_USER_FAIL",
    message: "created user fail!",
  },
  VERIFY_URL_EXPIRED: {
    key: "VERIFY_URL_EXPIRED",
    message: "Url สำหรับการยืนยันอีเมลล์หมดอายุ",
  },
};

@ObjectType()
export class AppError {
  @Field()
  code: string;

  @Field()
  message: string;
}

export const ErrorHandle = (e: IKeyPairsError): AppError => {
  return {
    code: e.key,
    message: e.message,
  };
};
