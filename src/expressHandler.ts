import { Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { refreshTokenSecret } from "./config/appConfig";
import { User } from "./entity/User";
import {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
} from "./utils/auth";

export const refreshTokenHandler = async (req: Request, res: Response) => {
  const token = req.cookies.bgm;
  if (!token) {
    return res.send({ ok: false, accessToken: "" });
  }

  let payload: any = null;
  try {
    payload = verify(token, refreshTokenSecret!);
  } catch (err) {
    return res.send({ ok: false, accessToken: "" });
  }

  const user = await User.findOne({ id: payload.userId });

  if (!user) {
    return res.send({ ok: false, accessToken: "" });
  }

  if (user.tokenVersion !== payload.tokenVersion) {
    return res.send({ ok: false, accessToken: "" });
  }

  sendRefreshToken(res, createRefreshToken(user));

  return res.send({
    ok: true,
    accessToken: createAccessToken(user),
    userId: user.id,
  });
};
