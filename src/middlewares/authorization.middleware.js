// file will be used for authorization of team members and team leaders
const httpStatus = require("http-status");

const { userRoles } = require("../config/vars");
const APIError = require("../errors/api-error.js");

// eslint-disable-next-line consistent-return
exports.teamLeadersAuthorization = async (req, res, next) => {
  try {
    // eslint-disable-next-line no-underscore-dangle
    if (req.userProfile._doc.role === userRoles.teamLeader) {
      next();
    } else {
      throw new APIError({
        status: httpStatus.BAD_REQUEST,
        message: "You are not authorized to view team members list",
        isPublic: true,
      });
    }
  } catch (error) {
    error.status = httpStatus.BAD_REQUEST;
    error.message = "You are not authorized to view team members list";
    return next(error);
  }
};
