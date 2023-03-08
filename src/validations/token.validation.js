const Joi = require("joi");
const { tokenMessages } = require("../config/messages");

const tokenValidations = {
  validateToken: {
    headers: Joi.object({
      token: Joi.string().required().messages({
        "string.empty": tokenMessages.sessionExpired,
      }),
    }).options({ allowUnknown: true }),
  },
};

module.exports = tokenValidations;
