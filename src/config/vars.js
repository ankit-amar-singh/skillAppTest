const path = require("path");

require("dotenv-safe").config({
  path: path.join(__dirname, "./../../.env"),
  example: path.join(__dirname, "./../../.env.example"),
});

const userRoles = {
  teamLeader: 0,
  teamMember: 1,
};

const dbDocStatus = {
  active: 0,
  inactive: 1,
  suspended: 2,
  deleted: 3,
};

const envVariables = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  mongoUrl: process.env.MONGO_URL,
  passwordEncryptionKey: process.env.PASSWORD_ENCRYPTION_KEY,
  redirectionBaseUrl: process.env.FRONTEND_BASE_URL,
  smtpServerHost: process.env.SMTP_SERVER_HOST,
  smtpServerPort: process.env.SMTP_SERVER_PORT,
  smtpUserName: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASS,
  smtpSenderEmail: process.env.SMTP_SENDER_ID,
};

module.exports = { envVariables, userRoles, dbDocStatus };
