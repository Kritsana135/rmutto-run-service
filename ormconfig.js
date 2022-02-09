const dotenv = require("dotenv");

const isDev = process.env.NODE_ENV == "dev"

dotenv.config({
  path: process.env.NODE_ENV == "dev" ? ".env.dev" : ".env.production",
});

console.log(
  process.env.TYPEORM_ENTITIES,
  process.env.DB_HOST,
  process.env.NODE_ENV,
  process.env.NODE_ENV === "dev"
);

module.exports = {
  type: "postgres",
  host: process.env.DB_HOST,
  port: 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  logging: false,
  extra: {
    ssl: !isDev,
  },
  entities: [process.env.TYPEORM_ENTITIES],
  migrations: [process.env.TYPEORM_MIGRATION],
};
