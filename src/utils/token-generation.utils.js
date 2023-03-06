const jwt = require("jsonwebtoken");

const { envVariables } = require("../config/vars.js");

exports.generateJwtToken = (userId) => {
  try {
    return jwt.sign(
      {
        userId,
        iat: Date.now(),
      },
      envVariables.jwtSecret,
    );
  } catch (error) {
    return error;
  }
};
