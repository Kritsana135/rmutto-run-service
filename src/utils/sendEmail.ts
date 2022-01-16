import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import {v4} from "uuid";
import {redis} from "./redis";
import {EmailConfig, ExpireTime} from "../config/appConfig";


export async function sendEmail(mail:Mail.Options) {

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: EmailConfig.user,
            pass: EmailConfig.pass,
        },
    });

    const info = await transporter.sendMail(mail);

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}



export const createConfirmEmail = (receiverEmail:string,confirmUrl: string):Mail.Options => ({
    from: EmailConfig.senderEmail, // sender address
    to: receiverEmail, // list of receivers
    subject: "RMUTTO RUN Email Verify", // Subject line
    html: `<a href='${confirmUrl}'>${confirmUrl}</a>`, // html body
})

export const createResetPassEmail = (receiverEmail:string,resetPassUrl: string):Mail.Options => ({
    from: EmailConfig.senderEmail, // sender address
    to: receiverEmail, // list of receivers
    subject: "RMUTTO RUN Reset Password", // Subject line
    html: `<a href='${resetPassUrl}'>${resetPassUrl}</a>`, // html body
})

export const createConfirmationUrl = async (userId: string) => {
    const token = v4();
    await redis.set(token, userId, "ex", ExpireTime.verifyEmail); // 1 day expiration

    return `${EmailConfig.verifyEmailUrl}/${token}`;
};

export const createResetUrl = async (userId: string) => {
    const token = v4();
    await redis.set(token, userId, "ex", ExpireTime.resetEmail); // 1 day expiration

    return `${EmailConfig.resetEmailUrl}/${token}`;
};

