import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";
import dotenv from "dotenv";
dotenv.config();

const { MAILTRAP_API_KEY, MAILTRAP_INBOX_ID } = process.env;

type TransportConfig = {
  token: string;
  testInboxId: number;
};

const config = (): TransportConfig => {
  return {
    token: MAILTRAP_API_KEY,
    testInboxId: +MAILTRAP_INBOX_ID,
  };
};

export const transport = nodemailer.createTransport(
  MailtrapTransport(config())
);
