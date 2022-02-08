import { CorsOptions } from "cors";

export const serverPort = process.env.SERVER_PORT || 4000;

const studioGraphqlEndpoint =
  process.env.STUDIO_APOLLO || "https://studio.apollographql.com";
const webEndpoint = process.env.WEB_ENDPOINT || "http://localhost:3000";
export const corsOptions: CorsOptions = {
  origin: [studioGraphqlEndpoint, webEndpoint],
  credentials: true,
};

export const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
export const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

export const ExpireTime = {
  verifyEmail: 60 * 60 * 24, // 1 day
  resetEmail: 60 * 60 * 24, // 1 day
};

// email
export const EmailConfig = {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
  senderEmail: '"RMUTTO RUN Service 🏃" ',
  verifyEmailUrl: `${webEndpoint}/user/verify`,
  resetEmailUrl: `${webEndpoint}/user/reset`,
};

type TENV = "dev" | "prod";

export const ENV: TENV = (process.env.NODE_ENV as TENV) || "prd";
