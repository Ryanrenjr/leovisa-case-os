import nodemailer from "nodemailer";
import { REMINDER_FROM } from "./reminder-email";

export function createGmailTransport() {
  const password = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  if (!password || !/^[a-zA-Z0-9]{16}$/.test(password)) {
    throw new Error("GMAIL_APP_PASSWORD must be a 16-character Google app password");
  }
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: REMINDER_FROM, pass: password },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    logger: false,
    debug: false,
  });
}
