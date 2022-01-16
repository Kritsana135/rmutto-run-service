import {sign} from "jsonwebtoken";
import {User} from "../entity/User";
import {accessTokenSecret, refreshTokenSecret} from "../config/appConfig";
import {Response} from "express";

export const createAccessToken = (user: User) => {
    return sign({ userId: user.id }, accessTokenSecret!, {
        expiresIn: "1h"
    });
};

export const createRefreshToken = (user: User) => {
    return sign(
        { userId: user.id, tokenVersion: user.tokenVersion },
        refreshTokenSecret!,
        {
            expiresIn: "7d"
        }
    );
};

export const sendRefreshToken = (res: Response, token: string) => {
    res.cookie("bgm", token, {
        httpOnly: true,
        path: "/refresh_token"
    });
};