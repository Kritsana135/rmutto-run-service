import "dotenv/config";
import "reflect-metadata";
import express from "express";
import { corsOptions, serverPort } from "./config/appConfig";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import cors from "cors";
import cookieParser from "cookie-parser";
import { refreshTokenHandler } from "./expressHandler";
import { graphqlUploadExpress } from "graphql-upload";

(async () => {
  const appExpress = await express();

  appExpress.use(cors(corsOptions));
  appExpress.use(cookieParser());
  appExpress.use(
    "/graphql",
    graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 })
  );

  appExpress.get("/", (_, res) => res.send("hello"));
  appExpress.post("/refresh_token", refreshTokenHandler);

  await createConnection();

  const apolloServer = await new ApolloServer({
    schema: await buildSchema({
      resolvers: [__dirname + "/modules/**/**.ts"],
    }),
    context: ({ req, res }) => ({ req, res }),
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app: appExpress, cors: false });

  appExpress.listen(serverPort, () => {
    console.log(`express start at http://localhost:${serverPort}`);

    console.log(process.cwd());
  });
})();
