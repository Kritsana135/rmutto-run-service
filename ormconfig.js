const dotenv = require("dotenv");

dotenv.config({
  path: process.env.NODE_ENV == "dev" ? ".env.dev" : ".env.production",
});

console.log(
  process.env.TYPEORM_ENTITIES,
  process.env.NODE_ENV,
  process.env.NODE_ENV === "dev"
);

module.exports = {
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "20989",
  database: "rmutto-run",
  synchronize: true,
  logging: false,
  entities: [process.env.TYPEORM_ENTITIES],
  migrations: [process.env.TYPEORM_MIGRATION],
};
