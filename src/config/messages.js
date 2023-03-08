const userMessages = {
  emailAlreadyExist: "Oops! This email already exists",
  emailVerificationLink: "Check your email! We sent a link to verify your email.",
  userDoesNotExist: "Hmm...this user does not exist",
  inactiveUser: "This user is currently inactive",
  passwordResetTokenExpired: "Password reset token is invalid or has expired.",
  accountVerificationAndLoginWithCred:
    "You have verified your account successfully, please log in with your credentials.",
  userLoggedOut: "User logged out successfully",
};

const tokenMessages = {
  tokenNotValid: "Token is not valid",
  sessionExpired: "Session Expired!",
};

module.exports = {
  userMessages,
  tokenMessages,
};
