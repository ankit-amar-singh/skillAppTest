const Joi = require("joi");
// eslint-disable-next-line import/no-extraneous-dependencies
Joi.objectId = require("joi-objectid")(Joi);

const userValidation = {
  registerValidation: {
    body: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required().min(6).max(128),
    }),
  },
  registerTeamMemberValidation: {
    body: Joi.object({
      name: Joi.string().required(),
      surname: Joi.string().required(),
      email: Joi.string().email().required(),
      position: Joi.string().required(),
    }),
  },
  passwordRegistrationValidationForTeamMember: {
    body: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required().min(6).max(128),
    }),
  },
  signinValidation: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required().min(6).max(128),
    }),
  },
  validateTokenInBodyForEmailVerification: {
    body: Joi.object({
      token: Joi.string().required(),
    }),
  },
  forgotPasswordValidation: {
    body: Joi.object({
      email: Joi.string().email().required(),
    }),
  },
  resetPasswordValidation: {
    body: Joi.object({
      resetPasswordToken: Joi.string().required(),
      password: Joi.string().required().min(6).max(128),
    }),
  },
};

module.exports = userValidation;
