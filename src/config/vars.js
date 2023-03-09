const path = require("path");

console.log(
  "path:",
  path.join(__dirname, `./../../env/${process.env.NODE_ENV || ""}.env`)
);
require("dotenv-safe").config({
  path: path.join(__dirname, `./../../env/${process.env.NODE_ENV || ""}.env`),
  example: path.join(__dirname, "./../../env/.env.example"),
});

const userRoles = {
  teamLeader: 0,
  teamMember: 1,
};

const berlinTimeZone = "Europe/Berlin";

const dbDocStatus = {
  active: 0,
  inactive: 1,
  suspended: 2,
  deleted: 3,
};
console.log(
  "Process.Env.MONGO_URL",
  process.env.MONGO_URL,
  "ENV:",
  process.env.NODE_ENV
);
const envVariables = {
  env: process.env.NODE_ENV || "",
  host: process.env.NODE_ENV || "localhost",
  port: process.env.PORT || "3000",
  mongoUrl: process.env.MONGO_URL,
  passwordEncryptionKey: process.env.PASSWORD_ENCRYPTION_KEY,
  redirectionBaseUrl: process.env.FRONTEND_BASE_URL,
  smtpServerHost: process.env.SMTP_SERVER_HOST,
  smtpServerPort: process.env.SMTP_SERVER_PORT,
  smtpUserName: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASS,
  smtpSenderEmail: process.env.SMTP_SENDER_ID,
};

module.exports = {
  envVariables,
  userRoles,
  dbDocStatus,
  berlinTimeZone,
};
