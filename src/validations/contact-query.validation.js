const Joi = require("joi");

const contactUsQueryValidation = {
  queryValidation: {
    body: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      message: Joi.string().required().max(800),
    }),
  },
};

module.exports = contactUsQueryValidation;
