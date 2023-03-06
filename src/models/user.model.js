const mongoose = require("mongoose");

const httpStatus = require("http-status");
const { hash } = require("bcryptjs");
const { compare } = require("bcryptjs");
const APIError = require("../errors/api-error.js");
const { envVariables, dbDocStatus, userRoles } = require("../config/vars.js");

const { userMessages } = require("../config/messages");

const { Schema, model } = mongoose;
const { env } = envVariables;

const tokenSchema = new Schema({
  uuid: {
    type: String,
  },
  timestamp: {
    type: Number,
    default: Date.now(),
  },
  deviceType: {
    type: String,
  },
  loginCount: {
    type: Number,
  },
});

/**
 * User Schema
 * @private
 */
const userSchema = new Schema(
  {
    email: {
      type: String,
      match: /^\S+@\S+\.\S+$/,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 128,
    },
    role: {
      type: Number,
      enum: [userRoles.teamLeader, userRoles.teamMember], // 1= user and 2 = admin and 3=speaker
      default: userRoles.teamLeader,
    },
    name: {
      type: String,
      maxlength: 128,
      trim: true,
    },
    activeToken: {
      type: String,
    },
    emailVerificationToken: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    tokens: [tokenSchema],
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function save(next) {
  try {
    if (!this.isModified("password")) return next();
    const rounds = env === "test" ? 1 : 10;

    const hashedPassword = await hash(this.password, rounds);
    this.password = hashedPassword;

    return next();
  } catch (error) {
    return next(error);
  }
});

userSchema.method({
  transform() {
    const transformed = {};
    const fields = ["id", "username", "email", "updatedAt", "createdAt", "role"];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

userSchema.statics.checkDuplicateMail = (error) => {
  if (error.code === 11000) {
    return new APIError({
      message: "Email already exist",
      status: httpStatus.CONFLICT,
      isPublic: true,
    });
  }
  return error;
};

userSchema.statics.getUserByEmailOrUsername = async (email) => {
  const User = model("User", userSchema);
  const user = await User.findOne({
    email,
  });
  if (!user) {
    throw new APIError({
      message: "User does not exist",
      status: httpStatus.NOT_FOUND,
      isPublic: true,
    });
  }
  return user;
};

userSchema.statics.getAnyUserById = async (userId) => {
  const User = model("User", userSchema);
  const user = await User.findOne({
    _id: userId,
  }).exec();
  if (!user) {
    throw new APIError({
      message: userMessages.userDoesNotExist,
      status: httpStatus.NOT_FOUND,
      isPublic: true,
    });
  }
  if (user.status === dbDocStatus.inactive) {
    throw new APIError({
      message: userMessages.inactiveUser,
      status: httpStatus.UNAUTHORIZED,
      isPublic: true,
    });
  }
  return user;
};

userSchema.statics.comparePassword = async (password, hashedPassword) => {
  const isPasswordEqual = await compare(password, hashedPassword);
  if (!isPasswordEqual) {
    throw new APIError({
      message: "Invalid Password",
      status: httpStatus.NOT_ACCEPTABLE,
      isPublic: true,
    });
  }
  return isPasswordEqual;
};

module.exports = model("User", userSchema);
