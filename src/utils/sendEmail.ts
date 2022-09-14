import fs from "fs";
import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { v4 } from "uuid";
import { EmailConfig, ExpireTime } from "../config/appConfig";
import { redis } from "./redis";

export async function sendEmail(mail: Mail.Options) {
  console.log("EmailConfig", EmailConfig);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EmailConfig.user,
      pass: EmailConfig.pass,
    },
  });

  const info = await transporter.sendMail(mail);

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

export const createConfirmEmail = (
  receiverEmail: string,
  confirmUrl: string
): Mail.Options => {
  const file = fs.readFileSync("src/email/confirmEmail.html");
  const html = file
    .toString()
    .replace("{{%CONFIRM_URL%}}", confirmUrl)
    .replace("{{%CLIENT_URL%}}", process.env.WEB_ENDPOINT!);
  return {
    from: EmailConfig.senderEmail, // sender address
    to: receiverEmail, // list of receivers
    subject: "RMUTTO RUN Email Verify", // Subject line
    html,
  };
};

export const createResetPassEmail = (
  receiverEmail: string,
  resetPassUrl: string
): Mail.Options => {
  const file = fs.readFileSync("src/email/recover.html");
  const html = file
    .toString()
    .replace("{{%RESET_URL%}}", resetPassUrl)
    .replace("{{%CLIENT_URL%}}", process.env.WEB_ENDPOINT!);
  return {
    from: EmailConfig.senderEmail, // sender address
    to: receiverEmail, // list of receivers
    subject: "RMUTTO RUN Reset Password", // Subject line
    html,
  };
};

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
