import { ApolloServer } from "apollo-server-express";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { graphqlUploadExpress } from "graphql-upload";
import notifier from "node-notifier";
import "reflect-metadata";
const dotenv = require("dotenv");

dotenv.config({
  path: process.env.NODE_ENV == "dev" ? ".env.dev" : ".env.production",
});

import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { corsOptions, ENV, serverPort } from "./config/appConfig";
import { refreshTokenHandler, deleteTokenHandler } from "./expressHandler";

(async () => {
  const appExpress = express();

  appExpress.use(cors(corsOptions));
  appExpress.use(cookieParser());
  appExpress.use("/profile", express.static("images/profile"));
  appExpress.use("/progress", express.static("images/progress"));
  appExpress.use(
    "/graphql",
    graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 })
  );

  appExpress.get("/", (_, res) => res.send("hello"));
  appExpress.post("/refresh_token", refreshTokenHandler);
  appExpress.post("/sign_out", deleteTokenHandler);

  await createConnection().then(() => console.log("connected DB  👌"));

  const resolverPath =
    ENV === "dev"
      ? __dirname + "/modules/**/**.ts"
      : __dirname + "/modules/**/**.js";
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [resolverPath],
    }),
    context: ({ req, res }) => ({ req, res }),
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app: appExpress, cors: false });

  appExpress.listen(serverPort, () => {
    const startMessage = `express start at http://localhost:${serverPort}`;
    console.log(startMessage);

    if (ENV === "dev") {
      notifier.notify({ message: startMessage });
    }
  });
})().catch((err) => {
  console.log(err);
  if (ENV === "dev") {
    notifier.notify({ message: "Server Error!!!" });
  }
});
