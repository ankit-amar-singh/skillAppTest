const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
// eslint-disable-next-line import/no-extraneous-dependencies
const momenttz = require("moment-timezone");

const {
  envVariables,
  berlinTimeZone,
  userRoles,
} = require("../config/vars.js");
const { userMessages, tokenMessages } = require("../config/messages");
const APIError = require("../errors/api-error.js");
const User = require("../models/user.model.js");

const { decryptGivenText, encryptGivenText } = require("../utils/security");
const { generateJwtToken } = require("../utils/token-generation.utils");
const {
  sendEmailVerificationMail,
  sendForgotPasswordMail,
  sendInvitationEmail,
} = require("../utils/mails.utils");

const { CREATED, OK, UNPROCESSABLE_ENTITY, UNAUTHORIZED } = httpStatus;
const { jwtSecret } = envVariables;

// function for internal use of converting password into encrypted form
exports.encryptText = async (req, res, next) => {
  try {
    const password = req.body.password ? req.body.password : undefined;
    const cipherText = encryptGivenText(password);
    const bytes = decryptGivenText(cipherText);
    const responseObj = {
      encryptedText: cipherText,
      decryptedText: bytes,
    };
    return res.status(200).json(responseObj);
  } catch (error) {
    return next(error);
  }
};

exports.test = async (req, res, next) => {
  try {
    const mailTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "skill.app22@gmail.com",
        pass: "Data@12345",
      },
    });

    const mailDetails = {
      from: "skill.app22@gmail.com",
      to: "skill.app22@gmail.com",
      subject: "Test mail",
      text: "Node.js testing mail for GeeksforGeeks",
    };

    let emailError = "No";
    mailTransporter.sendMail(mailDetails, (err, data) => {
      if (err) {
        console.log("Error Occurs");
        emailError = "Yes";
      } else {
        console.log("Email sent successfully");
      }
    });
    return res
      .status(200)
      .json({ body: req.body, env: envVariables, emailError });
  } catch (error) {
    return next(error);
  }
};

// function for registration of team leaders
exports.register = async (req, res, next) => {
  try {
    const decryptedPassword = decryptGivenText(req.body.password);
    req.body.password = decryptedPassword;
    const email = req.body.email.toString();
    const existingUser = await User.findOne({
      email,
    }).exec();
    if (existingUser) {
      throw new APIError({
        status: httpStatus.UNPROCESSABLE_ENTITY,
        message: userMessages.emailAlreadyExist,
        isPublic: true,
      });
    }
    req.body.role = userRoles.teamLeader;
    const userData = req.body;
    const user = await new User(userData).save();
    const transformedUser = user.transform();
    const token = generateJwtToken(transformedUser.id);
    await sendEmailVerificationMail(userData.email, token, user.role);
    await User.updateOne(
      { _id: transformedUser.id },
      {
        $set: {
          emailVerificationToken: token,
        },
      }
    ).exec();
    transformedUser.emailVerificationToken = token;
    const responseObj = {
      data: transformedUser,
      code: CREATED,
      message: userMessages.emailVerificationLink,
    };
    return res.status(CREATED).json(responseObj);
  } catch (error) {
    return next(error);
  }
};

// function for registration of team members
exports.teamMemberRegistration = async (req, res, next) => {
  try {
    // const decryptedPassword = decryptGivenText(req.body.password);
    // req.body.password = decryptedPassword;
    const email = req.body.email.toString();
    req.body.role = userRoles.teamMember;
    // checking if a team member with same email already exist
    const existingUser = await User.findOne({
      email,
    }).exec();
    if (existingUser) {
      // if team member already exist but email is not verified
      if (existingUser.isEmailVerified === false) {
        // sending mail for verification of team member
        await sendInvitationEmail(
          existingUser.email,
          // eslint-disable-next-line no-underscore-dangle
          req.userProfile._doc.name,
          existingUser.role
        );
        const existingUserResponse = {
          data: existingUser.transform(),
          code: CREATED,
          message: userMessages.emailVerificationLink,
        };
        return res.status(CREATED).json(existingUserResponse);
      }
      throw new APIError({
        status: httpStatus.UNPROCESSABLE_ENTITY,
        message: userMessages.emailAlreadyExist,
        isPublic: true,
      });
    }
    // if team member does not exist, save body as a new entry
    const userData = req.body;
    userData.teamLeaderId = req.userId;
    const user = await new User(userData).save();
    const transformedUser = user.transform();
    // sending mail for verification of team member
    await sendInvitationEmail(
      transformedUser.email,
      // eslint-disable-next-line no-underscore-dangle
      req.userProfile._doc.name,
      transformedUser.id
    );
    const responseObj = {
      data: transformedUser,
      code: CREATED,
      message: userMessages.emailVerificationLink,
    };
    return res.status(CREATED).json(responseObj);
  } catch (error) {
    return next(error);
  }
};

// function for completing the process for registration with password for team member
exports.registerTeamMemberWithPassword = async (req, res, next) => {
  try {
    const teamMemberId = req.params.teamMemberId.toString();
    const teamMemberInfo = await User.getAnyUserById(teamMemberId);
    const email = req.body.email.toString();
    if (email !== teamMemberInfo.email) {
      const existingEmailUser = await User.findOne({ email })
        .select("email _id")
        .exec();
      if (existingEmailUser) {
        throw new APIError({
          status: httpStatus.UNPROCESSABLE_ENTITY,
          message: userMessages.emailAlreadyExist,
          isPublic: true,
        });
      }
    }
    const decryptedPassword = decryptGivenText(req.body.password);
    req.body.password = decryptedPassword;
    teamMemberInfo.isEmailVerified = true;
    teamMemberInfo.name = req.body.name.toString();
    teamMemberInfo.email = email.toString();
    teamMemberInfo.password = req.body.password;
    await teamMemberInfo.save();
    return res.status(200).json(teamMemberInfo);
  } catch (error) {
    return next(error);
  }
};

// function for listing and search of team members
exports.teamMemberListing = async (req, res, next) => {
  try {
    const perPage = +req.query.count || 20;
    const page = +req.query.page || 1;
    let search;
    if (req.query.search && req.query.search !== undefined) {
      search = req.query.search.toString();
    }
    const filter = {
      role: userRoles.teamMember,
      teamLeaderId: req.userId.toString(),
    };
    if (search && search !== undefined) {
      const regex = new RegExp(search, "i");
      Object.assign(filter, {
        $or: [{ name: regex }, { email: regex }],
      });
    }
    let usersData = [];
    usersData = await User.find(filter)
      .sort({ createdAt: -1 })
      .select("name email surname position")
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();
    const totalUsersCount = await User.countDocuments(filter).exec();
    const usersResponse = {
      users: usersData,
      totalUsersCount,
    };
    const responseObj = {
      data: usersResponse,
      code: OK,
      message: "Team members list response",
    };
    return res.status(OK).json(responseObj);
  } catch (error) {
    return next(error);
  }
};

// function for details of any user
exports.userDetails = async (req, res, next) => {
  try {
    const userId = req.params.userId.toString();
    const usersResponse = await User.findById(userId)
      .select(
        "_id name email surname position teamLeaderId role status createdAt"
      )
      .populate({ path: "teamLeaderId", select: "_id id name" })
      .exec();

    const responseObj = {
      data: usersResponse,
      code: OK,
      message: "Team members details response",
    };
    return res.status(OK).json(responseObj);
  } catch (error) {
    return next(error);
  }
};

// function for sign in of any user
exports.signin = async (req, res, next) => {
  try {
    const decryptedPassword = decryptGivenText(req.body.password);
    req.body.password = decryptedPassword;
    const { email, password } = req.body;
    const user = await User.getUserByEmailOrUsername(email);
    if (user.isEmailVerified === false) {
      throw new APIError({
        message: "Email is not verified",
        status: httpStatus.NOT_ACCEPTABLE,
        isPublic: true,
      });
    }
    const transformedUser = user.transform();
    await User.comparePassword(password, user.password);
    const token = jwt.sign(
      {
        userId: transformedUser.id,
        iat: Date.now(),
      },
      jwtSecret
    );
    const currentMoment = momenttz.tz(berlinTimeZone);
    await User.updateOne(
      { _id: transformedUser.id },
      {
        $set: {
          lastLoginAt: currentMoment.format("MMM Do, YYYY"),
          activeToken: token,
        },
      }
    );
    if (user.role === userRoles.teamLeader) {
      transformedUser.teamLeaderCount = await User.countDocuments({
        role: userRoles.teamMember,
        teamLeaderId: transformedUser.id,
      }).exec();
    }
    transformedUser.activeToken = token;
    return res.status(OK).json({ user: transformedUser });
  } catch (error) {
    return next(error);
  }
};

// function for logging out user from skillapp
exports.logOutUser = async (req, res, next) => {
  try {
    const userId = req.userId ? req.userId : undefined;
    if (!userId) {
      throw new APIError({
        message: tokenMessages.tokenNotValid,
        status: UNAUTHORIZED,
        isPublic: true,
      });
    }
    const existingUser = await User.getAnyUserById(userId);
    if (!existingUser) {
      throw new APIError({
        message: userMessages.userDoesNotExist,
        code: UNPROCESSABLE_ENTITY,
        isPublic: true,
      });
    }
    await User.updateOne(
      // eslint-disable-next-line no-underscore-dangle
      { _id: existingUser._id },
      {
        $set: {
          activeToken: null,
        },
      }
    ).exec();
    const responseObj = {
      data: {},
      code: OK,
      message: userMessages.userLoggedOut,
    };
    return res.status(200).json(responseObj);
  } catch (error) {
    return next(error);
  }
};

// function for verification of email
exports.verifyEmail = async (req, res, next) => {
  try {
    const userId = req.userId ? req.userId : undefined;
    if (!userId) {
      throw new APIError({
        message: tokenMessages.tokenNotValid,
        status: UNAUTHORIZED,
        isPublic: true,
      });
    }
    const existingUser = await User.getAnyUserById(userId);
    if (existingUser.isEmailVerified === true) {
      return res.status(422).json({
        message: userMessages.emailAlreadyVerifiedContinueToLogin,
        code: UNPROCESSABLE_ENTITY,
        data: null,
      });
    }
    await User.updateOne(
      // eslint-disable-next-line no-underscore-dangle
      { _id: existingUser._id },
      {
        $set: {
          isEmailVerified: true,
        },
      }
    ).exec();
    const responseObj = {
      data: null,
      code: OK,
      message: userMessages.accountVerificationAndLoginWithCred,
    };
    return res.status(200).json(responseObj);
  } catch (error) {
    return next(error);
  }
};

// POST /forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).exec();

    if (!user) {
      throw new APIError({
        status: httpStatus.UNPROCESSABLE_ENTITY,
        message: userMessages.userDoesNotExist,
        isPublic: true,
      });
    }
    // Generate password reset token and expiration date
    user.resetPasswordToken = crypto.randomBytes(16).toString("hex");
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    console.log(user);
    await user.save();
    await sendForgotPasswordMail(user.email, user.resetPasswordToken);
    return res.status(200).json({ message: "Password reset email sent." });
  } catch (err) {
    return next(err);
  }
};

// POST /reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { resetPasswordToken } = req.body;
    const decryptedPassword = decryptGivenText(req.body.password);
    req.body.password = decryptedPassword;

    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken,
    });
    if (!user) {
      throw new APIError({
        status: httpStatus.UNPROCESSABLE_ENTITY,
        message: userMessages.passwordResetTokenExpired,
        isPublic: true,
      });
    }

    // Set new password and clear reset token fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return res.status(200).json({ message: "Password reset successful." });
  } catch (err) {
    return next(err);
  }
};
