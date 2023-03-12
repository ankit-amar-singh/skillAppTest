const { json, urlencoded } = require("body-parser");

const express = require("express");
const cors = require("cors");
const { serve, setup } = require("swagger-ui-express");
const { connectDB } = require("./db.js");
const routes = require("../routes/v1/index.js");
const swaggerDocument = require("../../swagger.json");
const { tokenMessages } = require("./messages");

const app = express();
app.use(cors());
// Routes

connectDB();

app.use(json());
app.use(urlencoded({ extended: false }));

app.use((req, res, next) => {
  // console.log("req", req);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,x-access-token,Accept,Authorization",
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PATCH,PUT,DELETE,OPTIONS",
  );
  next();
});

app.use("/api-doc", serve, setup(swaggerDocument));

app.use("/v1", routes);

// eslint-disable-next-line no-unused-vars
app.use((req, res, next) => res.status(404).json({
  code: 404,
  errorMessage: "URL not found",
  isPublic: true,
}));

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  let status = error.status || 400;
  let message;
  // eslint-disable-next-line no-console
  console.error(error);
  if (error.details) {
    if (error.isPublic && error.isPublic === false) {
      // eslint-disable-next-line no-param-reassign
      error.isPublic = true;
    }
    if (error.details.headers) {
      const [errorMessage] = error.details.headers.map((i) => i.message);
      message = errorMessage;
    } else if (error.details.body) {
      const [errorMessage] = error.details.body.map((i) => i.message);
      message = errorMessage;
    } else if (error.details.query) {
      const [errorMessage] = error.details.query.map((i) => i.message);
      message = errorMessage;
    } else if (error.details.path) {
      const [errorMessage] = error.details.path.map((i) => i.message);
      message = errorMessage;
    }
  } else {
    message = error.message;
  }
  if (error.isPublic === false) {
    message = "Something went wrong..";
    status = 500;
  }
  if (message === tokenMessages.sessionExpired) {
    status = 401;
  }
  return res.status(status).json({
    status,
    errorMessage: message,
  });
});

module.exports = app;
