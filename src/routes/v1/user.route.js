const express = require("express");

const router = express.Router();
const { validate } = require("express-validation");
// eslint-disable-next-line import/named
const {
  register,
  signin,
  encryptText,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../../controllers/user.controller.js");
const userValidation = require("../../validations/user.validation.js");

const { tokenAuthenticationInBody } = require("../../middlewares/token-verification.middleware");

// eslint-disable-next-line max-len
const {
  registerValidation,
  signinValidation,
  validateTokenInBodyForEmailVerification,
  forgotPasswordValidation,
  resetPasswordValidation,
} = userValidation;

router.route("/encrypt").post(encryptText);

router.route("/register").post(validate(registerValidation), register);
router.route("/signin").post(validate(signinValidation), signin);

router
  .route("/verify-email")
  .post(validate(validateTokenInBodyForEmailVerification), tokenAuthenticationInBody, verifyEmail);

router.route("/forgot-password").post(validate(forgotPasswordValidation), forgotPassword);

router.route("/reset").post(validate(resetPasswordValidation), resetPassword);

module.exports = router;
