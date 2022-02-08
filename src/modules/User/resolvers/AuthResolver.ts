import { compare, hash } from "bcryptjs";
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getManager } from "typeorm";
import { User } from "../../../entity/User";
import { AuthMessage, AuthMessage2, ErrorHandle } from "../../../global/error";
import { CustomContext } from "../../../global/interface";
import { ResponseClass } from "../../../global/types";
import {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
} from "../../../utils/auth";
import { performNewHashData, redis } from "../../../utils/redis";
import {
  createConfirmationUrl,
  createConfirmEmail,
  createResetPassEmail,
  createResetUrl,
  sendEmail,
} from "../../../utils/sendEmail";
import { isRunner } from "../../middleware/auth/runnerAuth";
import {
  CreateUserRes,
  LoginInput,
  LoginRes,
  ResetPassEmailInput,
  ResetPassInput,
  SignupInput,
} from "../types/AuthType";

@Resolver()
export class AuthResolver {
  @Query(() => String)
  handShake(): string {
    return "Ho~~~";
  }

  @Mutation(() => CreateUserRes)
  async signup(@Arg("input") signupInput: SignupInput): Promise<CreateUserRes> {
    const hashedPassword = await hash(signupInput.password, 12);
    try {
      const hadEmail = await User.findOne({
        where: { email: signupInput.email },
      });
      if (hadEmail) {
        return ErrorHandle(AuthMessage2.ALREADY_EMAIL);
      }

      const user = new User();
      user.password = hashedPassword;
      user.email = signupInput.email;
      user.firstName = signupInput.firstName;
      user.lastName = signupInput.lastName;
      user.address = signupInput.address;
      user.phoneNumber = signupInput.phoneNumber;
      const createdUser = await getManager().save(user);

      await sendEmail(
        createConfirmEmail(
          signupInput.email,
          await createConfirmationUrl(createdUser.id)
        )
      );
      return {
        code: "OK",
        message: "created user successful!",
        payload: createdUser,
      };
    } catch (e) {
      console.log(e);
      return ErrorHandle(AuthMessage2.CREATE_USER_FAIL);
    }
  }

  @Mutation(() => LoginRes)
  async login(
    @Arg("input") { email, password }: LoginInput,
    @Ctx() { res }: CustomContext
  ): Promise<LoginRes> {
    //check user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return ErrorHandle(AuthMessage2.USER_NOT_FOUND);
    }

    if (!user.isVerify) {
      return ErrorHandle(AuthMessage2.USER_NOT_VERIFY);
    }

    const valid = await compare(password, user.password);
    if (!valid) {
      return ErrorHandle(AuthMessage2.INVALID_PASSWORD);
    }

    sendRefreshToken(res, createRefreshToken(user));
    return {
      code: "OK",
      message: "login successful!",
      payload: {
        accessToken: createAccessToken(user),
        userId: user.id,
      },
    };
  }

  @Mutation(() => ResponseClass)
  async verifyUser(@Arg("token") token: string): Promise<ResponseClass> {
    const userId = await redis.get(token);
    console.log(token, userId);
    if (!userId) {
      return ErrorHandle(AuthMessage2.TOKEN_NOT_FOUND);
    }
    const user = await User.findOne({ id: userId });
    if (!user) {
      return ErrorHandle(AuthMessage2.USER_NOT_FOUND);
    }
    await User.update({ id: userId }, { isVerify: true });
    // remove verify token
    await redis.del(token);
    // add info in leaderboard
    await performNewHashData({
      km: user.km.toString(),
      displayName: `${user.firstName} ${user.lastName}`,
      id: userId,
      bio: user.bio,
    });
    await redis.zadd("leaderboard_set", user.km, user.id);
    return {
      code: "OK",
      message: "verify user successful!",
    };
  }

  @Mutation(() => Boolean)
  async resendVerify(@Arg("email") email: string): Promise<boolean> {
    const user = await User.findOne({ email, isVerify: false });
    if (!user) {
      return false;
    }
    await sendEmail(
      createConfirmEmail(email, await createConfirmationUrl(user.id))
    );
    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isRunner)
  async changePassword(
    @Arg("oldPassword") oldPass: string,
    @Arg("newPassword") newPass: string,
    @Ctx() { payload }: CustomContext
  ): Promise<Boolean> {
    const user = await User.findOne({ id: payload?.userId });
    if (!user) {
      throw new Error(AuthMessage.USER_NOT_FOUND);
    }

    if (!user.isVerify) {
      throw new Error(AuthMessage.USER_NOT_VERIFY);
    }

    const valid = await compare(oldPass, user.password);
    if (!valid) {
      throw new Error(AuthMessage.INVALID_PASSWORD);
    }
    const hashedPassword = await hash(newPass, 12);
    await User.update({ id: payload?.userId }, { password: hashedPassword });
    return true;
  }

  @Mutation(() => Boolean)
  async sendResetPassEmail(
    @Arg("input") input: ResetPassEmailInput
  ): Promise<Boolean> {
    const user = await User.findOne({ email: input.email });
    if (!user) {
      return false;
    }
    await sendEmail(
      createResetPassEmail(input.email, await createResetUrl(user.id))
    );
    return true;
  }

  @Mutation(() => Boolean)
  async resetPass(
    @Arg("input") { newPass, token }: ResetPassInput
  ): Promise<boolean> {
    const userId = await redis.get(token);

    if (!userId) {
      return false;
    }

    const hashedPassword = await hash(newPass, 12);
    await User.update({ id: userId }, { password: hashedPassword });
    await redis.del(token);

    return true;
  }
}
