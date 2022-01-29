import { verify } from "jsonwebtoken";
import { MiddlewareFn } from "type-graphql";
import { accessTokenSecret } from "../../../config/appConfig";
import { User, UserRole } from "../../../entity/User";
import { AuthMessage } from "../../../global/error";
import { CustomContext } from "../../../global/interface";

export const isAdmin: MiddlewareFn<CustomContext> = async (
  { context },
  next
) => {
  const authorization = context.req.headers["authorization"];
  if (!authorization) {
    throw new Error(AuthMessage.NOT_AUTH);
  }

  try {
    const payload = verify(authorization, accessTokenSecret!);
    const { userId } = payload;
    const isAdmin = await User.findOne({
      id: userId,
      userType: UserRole.ADMIN,
    });
    if (!isAdmin) {
      throw new Error(AuthMessage.NOT_AUTH);
    }
    context.payload = payload as any;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }

  return next();
};
