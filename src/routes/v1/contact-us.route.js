const express = require("express");

const router = express.Router();
const { validate } = require("express-validation");
// eslint-disable-next-line import/named
const { submitQuery } = require("../../controllers/contact-us.controller");
const contactUsValidation = require("../../validations/contact-query.validation");

const { queryValidation } = contactUsValidation;

router.route("/query").post(validate(queryValidation), submitQuery);

module.exports = router;
