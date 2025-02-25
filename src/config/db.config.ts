import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
dotenv.config();

const { DB_URL } = process.env;

export const db = new Sequelize(DB_URL, {
  models: [__dirname + "/../models/**/*"],
  dialectOptions: {
    ssl: {
      require: false,
    },
  },
  logging: false,
});
