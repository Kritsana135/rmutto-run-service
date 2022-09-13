const dotenv = require("dotenv");

const isDev = process.env.NODE_ENV == "dev";

dotenv.config({
  path: process.env.NODE_ENV == "dev" ? ".env.dev" : ".env.production",
});

console.log(
  process.env.TYPEORM_ENTITIES,
  process.env.DB_HOST,
  process.env.NODE_ENV,
  process.env.NODE_ENV === "dev",
  isDev
);

module.exports = {
  type: "postgres",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  extra: {
    ssl: !isDev,
  },
  entities: [
    `${process.env.BUILD_DIRECTORY || "src"}/entity/**/*.${
      process.env.BUILD_TARGET || "ts"
    }`,
  ],
  migrations: [
    `${process.env.BUILD_DIRECTORY || "src"}/migration/**/*.${
      process.env.BUILD_TARGET || "ts"
    }`,
  ],
};
