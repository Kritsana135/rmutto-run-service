import { sign } from "jsonwebtoken";
import { User } from "../entity/User";
import { accessTokenSecret, refreshTokenSecret } from "../config/appConfig";
import { Response } from "express";
import { AuthMessage } from "../global/error";

export const createAccessToken = (user: User) => {
  return sign({ userId: user.id }, accessTokenSecret!, {
    expiresIn: "1h",
  });
};

export const createRefreshToken = (user: User) => {
  return sign(
    { userId: user.id, tokenVersion: user.tokenVersion },
    refreshTokenSecret!,
    {
      expiresIn: "7d",
    }
  );
};

export const sendRefreshToken = (res: Response, token: string) => {
  res.cookie("bgm", token, {
    httpOnly: true,
    path: "/refresh_token",
  });
};

export const checkUser = async (id: string) => {
  const user = await User.findOne({ id });
  if (!user) {
    throw new Error(AuthMessage.USER_NOT_FOUND);
  }

  return user;
};
