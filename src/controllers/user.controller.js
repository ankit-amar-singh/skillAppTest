const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { envVariables } = require("../config/vars.js");
const { userMessages, tokenMessages } = require("../config/messages");
const APIError = require("../errors/api-error.js");
const User = require("../models/user.model.js");

const { decryptGivenText, encryptGivenText } = require("../utils/security");
const { generateJwtToken } = require("../utils/token-generation.utils");
const { sendEmailVerificationMail, sendForgotPasswordMail } = require("../utils/mails.utils");

const {
  CREATED, OK, UNPROCESSABLE_ENTITY, UNAUTHORIZED,
} = httpStatus;
const { jwtSecret } = envVariables;

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

exports.register = async (req, res, next) => {
  try {
    const decryptedPassword = decryptGivenText(req.body.password);
    req.body.password = decryptedPassword;
    const email = req.body.email.toString();
    const existingUser = await User.findOne({
      email,
    }).exec();
    if (existingUser) {
      const existingTransformedUser = existingUser.transform();
      if (existingUser.isEmailVerified === false) {
        const existingUserToken = generateJwtToken(existingTransformedUser.id);
        await User.updateOne(
          { _id: existingTransformedUser.id },
          {
            $set: {
              emailVerificationToken: existingUserToken,
            },
          },
        ).exec();
        existingUser.emailVerificationToken = existingUserToken;
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
      },
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
      jwtSecret,
    );
    await User.updateOne(
      { _id: transformedUser.id },
      {
        $set: {
          activeToken: token,
        },
      },
    );
    transformedUser.activeToken = token;
    return res.status(OK).json({ user: transformedUser });
  } catch (error) {
    return next(error);
  }
};

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
      },
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
