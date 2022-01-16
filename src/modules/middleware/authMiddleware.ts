import {MiddlewareFn} from "type-graphql";
import {CustomContext} from "../../global/interface";
import {verify} from "jsonwebtoken";
import {AuthMessage} from "../../global/errorMessage";
import {accessTokenSecret} from "../../config/appConfig";

export const isAuth: MiddlewareFn<CustomContext> = ({ context }, next) => {
    const authorization = context.req.headers["authorization"];

    if (!authorization) {
        throw new Error(AuthMessage.NOT_AUTH);
    }

    try {
        const token = authorization.split(" ")[1];
        const payload = verify(token, accessTokenSecret!);
        context.payload = payload as any;
    } catch (err) {
        console.log(err);
        throw new Error(AuthMessage.NOT_AUTH);
    }

    return next();
};