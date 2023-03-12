const nodemailer = require("nodemailer");
const { envVariables } = require("../config/vars");

const {
  smtpServerHost,
  smtpServerPort,
  smtpUserName,
  smtpPassword,
  smtpSenderEmail,
  redirectionBaseUrl,
} = envVariables;
async function sendMail(mailOptions) {
  const transporter = nodemailer.createTransport({
    host: smtpServerHost,
    port: smtpServerPort,
    secure: false, // upgrade later with STARTTLS
    auth: {
      user: smtpUserName,
      pass: smtpPassword,
    },
  });
  const isConnectionSetup = await transporter.verify();
  if (!isConnectionSetup) {
    console.log("can not connect to smtp mail server");
    return;
  }
  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      console.log(err);
    }
    console.log(data);
  });
}

exports.sendEmailVerificationMailTest = async (userEmail, token, role) {
  return `<p>Welcome to SkillApp- you're almost ready to get started with your account!</p>
  <p> But first, we need to verify your email. Please click <a href=${redirectionBaseUrl}auth/verify-email/${token}?role=${role}>on this link</a> to verify your email.</p>
  <p>If you did not request to create a SkillApp account, please ignore this email!</p>`;
}

exports.sendEmailVerificationMail = async (userEmail, token, role) => {
  const mailOptions = {
    to: `${userEmail}`, // Change to your recipient
    from: smtpSenderEmail, // sender address
    subject: "Email Verification Mail",
    html: `<p>Welcome to SkillApp- you're almost ready to get started with your account!</p>
            <p> But first, we need to verify your email. Please click <a href=${redirectionBaseUrl}auth/verify-email/${token}?role=${role}>on this link</a> to verify your email.</p>
            <p>If you did not request to create a SkillApp account, please ignore this email!</p>`,
  };
  await sendMail(mailOptions);
};

exports.sendInvitationEmail = async (userEmail, inviterName, userId) => {
  const mailOptions = {
    to: `${userEmail}`, // Change to your recipient
    from: smtpSenderEmail, // sender address
    subject: "Invitation-Register on SkillApp",
    html: `<p>You have been invited to join SkillApp by ${inviterName}. To accept the invitation, please click on the following link:</p>
            <p> <a href=${redirectionBaseUrl}auth/invite/${userId}>on this link</a> to complete your registration process.</p>
            <p>If you do not want to create a SkillApp account, please ignore this email!</p>`,
  };
  await sendMail(mailOptions);
};

exports.sendForgotPasswordMail = async (email, resetPasswordToken) => {
  const mailOptions = {
    to: email,
    from: smtpSenderEmail,
    subject: "Reset your password on Your App",
    text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        ${redirectionBaseUrl}auth/reset-password/${resetPasswordToken}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };
  await sendMail(mailOptions);
};
