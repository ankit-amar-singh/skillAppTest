// eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies
const CryptoJS = require("crypto-js");
const { envVariables } = require("../config/vars");
// eslint-disable-next-line arrow-body-style
exports.encryptGivenText = (password) => {
  console.log(password, envVariables.passwordEncryptionKey);
  return CryptoJS.AES.encrypt(password, envVariables.passwordEncryptionKey).toString();
};

exports.decryptGivenText = (password) => {
  const bytes = CryptoJS.AES.decrypt(password, envVariables.passwordEncryptionKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};
