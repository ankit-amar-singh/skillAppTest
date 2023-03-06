const Joi = require("joi");
// eslint-disable-next-line import/no-extraneous-dependencies
Joi.objectId = require("joi-objectid")(Joi);
const { userRoles } = require("../config/vars");

const userValidation = {
  registerValidation: {
    body: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      role: Joi.number().valid(userRoles.teamLeader, userRoles.teamMember).required(),
      password: Joi.string().required().min(6).max(128),
    }),
  },
  signinValidation: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required().min(6).max(128),
      role: Joi.number().valid(userRoles.teamLeader, userRoles.teamMember).required(),
    }),
  },
  validateTokenInBodyForEmailVerification: {
    body: Joi.object({
      token: Joi.string().required(),
      role: Joi.number().valid(userRoles.teamLeader, userRoles.teamMember).required(),
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
