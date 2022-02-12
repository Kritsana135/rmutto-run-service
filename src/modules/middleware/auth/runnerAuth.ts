import { verify } from "jsonwebtoken";
import { MiddlewareFn } from "type-graphql";
import { accessTokenSecret } from "../../../config/appConfig";
import { AuthMessage } from "../../../global/error";
import { CustomContext } from "../../../global/interface";

export const isRunner: MiddlewareFn<CustomContext> = ({ context }, next) => {
  const authorization = context.req.headers["authorization"];
  if (!authorization) {
    throw new Error(AuthMessage.NOT_AUTH);
  }

  try {
    const payload = verify(authorization, accessTokenSecret!);
    context.payload = payload as any;
  } catch (err) {
    console.log(err);
    throw new Error(AuthMessage.TOKEN_EXPIRE);
  }

  return next();
};
