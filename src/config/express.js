const { json, urlencoded } = require("body-parser");

const express = require("express");
const cors = require("cors");
const { serve, setup } = require("swagger-ui-express");
const { connectDB } = require("./db.js");
const routes = require("../routes/v1/index.js");
const swaggerDocument = require("../../swagger.json");

const app = express();
app.use(cors());
// Routes

connectDB();

app.use(json());
app.use(urlencoded({ extended: false }));

app.use((req, res, next) => {
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
  // eslint-disable-next-line no-console
  console.log(error);
  const status = 400;
  const { message } = error;
  return res.status(status).json({
    code: status,
    errorMessage: message,
    isPublic: error.isPublic || false,
    details: error.details,
  });
});

module.exports = app;
