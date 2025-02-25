import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const { JWT_SECRET } = process.env;

export const generateJWT = (id: string): string => {
  const token = jwt.sign({ id }, JWT_SECRET, {
    expiresIn: "30d",
  });

  return token;
};
