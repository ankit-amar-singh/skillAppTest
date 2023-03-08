const express = require("express");

const router = express.Router();
const { validate } = require("express-validation");
// eslint-disable-next-line import/named
const {
  register,
  teamMemberRegistration,
  signin,
  encryptText,
  verifyEmail,
  forgotPassword,
  resetPassword,
  teamMemberListing,
  registerTeamMemberWithPassword,
  logOutUser,
} = require("../../controllers/user.controller.js");
const userValidation = require("../../validations/user.validation.js");
const tokenValidation = require("../../validations/token.validation");
const { tokenAuthentication, tokenAuthenticationInBody } = require("../../middlewares/token-verification.middleware");
const { teamLeadersAuthorization } = require("../../middlewares/authorization.middleware");
const { passwordRegistrationValidationForTeamMember } = require("../../validations/user.validation.js");
const upload = require("../../utils/file-upload.js");
// eslint-disable-next-line max-len
const {
  registerValidation,
  signinValidation,
  validateTokenInBodyForEmailVerification,
  forgotPasswordValidation,
  resetPasswordValidation,
} = userValidation;
const {
  validateToken,
} = tokenValidation;

router.route("/encrypt").post(encryptText);
// Register route for adding team leader
router.route("/register").post(validate(registerValidation), register);
// Register route for adding team member
router.route("/register-team-member").post(tokenAuthentication, upload.single('image'), teamMemberRegistration);
// password registration process for team member
router.route('/register-team-member-password/:teamMemberId').post(
  validate(passwordRegistrationValidationForTeamMember),
  registerTeamMemberWithPassword,
);
// Signin route for team members and team leaders
router.route("/signin").post(validate(signinValidation), signin);

router
  .route("/verify-email")
  .post(validate(validateTokenInBodyForEmailVerification), tokenAuthenticationInBody, verifyEmail);

router.route("/forgot-password").post(validate(forgotPasswordValidation), forgotPassword);

router.route("/reset").post(validate(resetPasswordValidation), resetPassword);

router
  .route("/logout")
  .patch(validate(validateToken), tokenAuthentication, logOutUser);

// Team members listing route
router
  .route("/team-members")
  .get(validate(validateToken), tokenAuthentication, teamLeadersAuthorization, teamMemberListing);

module.exports = router;
