const jwt = require("jsonwebtoken");
const httpStatus = require("http-status");
const { UNAUTHORIZED } = require("http-status");
const APIError = require("../errors/api-error");
const { envVariables, dbDocStatus } = require("../config/vars");
const User = require("../models/user.model.js");
const { userMessages, tokenMessages } = require("../config/messages");

const { jwtSecret } = envVariables;

// eslint-disable-next-line consistent-return
exports.tokenAuthentication = async (req, res, next) => {
  try {
    const { userId } = jwt.verify(req.headers.token, jwtSecret);
    const existingUser = await User.findOne({
      _id: userId,
    })
      .select("name email _id activeToken role status")
      .exec();
    if (!existingUser) {
      throw new APIError({
        message: "User not found",
        status: httpStatus.UNAUTHORIZED,
        isPublic: true,
      });
    }
    const { token } = req.headers;
    if (existingUser.activeToken !== token) {
      throw new APIError({
        message: tokenMessages.sessionExpired,
        status: httpStatus.UNAUTHORIZED,
        isPublic: true,
      });
    }
    if (existingUser.status === dbDocStatus.inactive) {
      throw new APIError({
        message: userMessages.inactiveUser,
        status: httpStatus.UNAUTHORIZED,
        isPublic: true,
      });
    }
    req.userId = userId;
    req.userProfile = { ...existingUser };
    next();
  } catch (error) {
    error.status = UNAUTHORIZED;
    error.message = tokenMessages.sessionExpired;
    return next(error);
  }
};

// eslint-disable-next-line consistent-return
exports.tokenAuthenticationInBody = (req, res, next) => {
  try {
    const { userId } = jwt.verify(req.body.token, jwtSecret);
    req.userId = userId;
    next();
  } catch (error) {
    error.status = UNAUTHORIZED;
    error.message = tokenMessages.sessionExpired;
    return next(error);
  }
};
