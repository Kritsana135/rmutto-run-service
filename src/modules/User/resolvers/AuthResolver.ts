import {Arg, Ctx, Mutation, Query, Resolver, UseMiddleware} from "type-graphql";
import {CreateUserRes, LoginInput, LoginRes, ResetPassEmailInput, ResetPassInput, SignupInput} from "../types/AuthType";
import {compare, hash} from "bcryptjs";
import {User} from "../../../entity/User";
import {CustomContext} from "../../../global/interface";
import {AuthMessage} from "../../../global/errorMessage";
import {createAccessToken, createRefreshToken, sendRefreshToken} from "../../../utils/auth";
import {redis} from "../../../utils/redis";
import {
    createConfirmationUrl,
    createConfirmEmail,
    createResetPassEmail,
    createResetUrl,
    sendEmail
} from "../../../utils/sendEmail";
import {isAuth} from "../../middleware/authMiddleware";

@Resolver()
export class AuthResolver {
    @Query(() => String)
    handShake ():string  {
        return 'Ho~~~'
    }

    @Mutation(() => CreateUserRes)
    async signup(@Arg("input") signupInput:SignupInput): Promise<CreateUserRes> {
        const hashedPassword = await hash(signupInput.password, 12);
        try {
            const createdUser = await User.insert({
                ...signupInput,
                password: hashedPassword
            })
            await sendEmail(createConfirmEmail(
                signupInput.email,
                await createConfirmationUrl(createdUser.raw.id)
            ))
            return {
                code:'OK',
                message: 'created user successful!',
                user: createdUser.raw
            }
        }catch (e) {
            console.log(e)
            return {
                code: 'FAIL',
                message: 'created user fail!',
            }
        }
    }

    @Mutation(() => LoginRes)
    async login(@Arg("input") {email,password}:LoginInput , @Ctx() {res}: CustomContext): Promise<LoginRes>{
        //check user
        const user = await User.findOne({where:{email}})
        if(!user){
            throw new Error(AuthMessage.USER_NOT_FOUND);
        }

        if(!user.isVerify){
            throw  new Error(AuthMessage.USER_NOT_VERIFY)
        }

        const valid = await compare(password, user.password);
        if (!valid) {
            throw new Error(AuthMessage.INVALID_PASSWORD);
        }

        sendRefreshToken(res, createRefreshToken(user));
        return {
            accessToken: createAccessToken(user)
        }
    }

    @Mutation(() => Boolean)
    async verifyUser(@Arg("token") token: string): Promise<boolean> {
        const userId = await redis.get(token);

        if (!userId) {
            return false;
        }

        await User.update({ id: userId }, { isVerify: true });
        await redis.del(token);

        return true;
    }

    @Mutation(() => Boolean)
    async resendVerify(@Arg("email") email: string): Promise<boolean> {
        const user = await User.findOne({email})
        if(!user){
            return false
        }
        await sendEmail(createConfirmEmail(
            email,
            await createConfirmationUrl(user.id)
        ))
        return true
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async changePassword(
        @Arg("oldPassword") oldPass: string,
        @Arg("newPassword") newPass : string,
        @Ctx() {payload}: CustomContext
    ) : Promise<Boolean> {
        const user = await User.findOne({id: payload?.userId})
        if(!user){
            throw new Error(AuthMessage.USER_NOT_FOUND);
        }

        if(!user.isVerify){
            throw  new Error(AuthMessage.USER_NOT_VERIFY)
        }

        const valid = await compare(oldPass, user.password);
        if (!valid) {
            throw new Error(AuthMessage.INVALID_PASSWORD);
        }
        const hashedPassword = await hash(newPass, 12);
        await User.update({id: payload?.userId},{password:hashedPassword})
        return true
    }

    @Mutation(() => Boolean)
    async sendResetPassEmail(@Arg("input") input:ResetPassEmailInput):Promise<Boolean> {
        const user = await User.findOne({email: input.email})
        if(!user) {
            return false
        }
        await sendEmail(createResetPassEmail(input.email,await createResetUrl(user.id) ))
        return  true
    }

    @Mutation(() => Boolean)
    async resetPass(
        @Arg("input") {newPass,token} : ResetPassInput,
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