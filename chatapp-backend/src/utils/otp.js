const crypto = require("crypto");
const { generateToken, verifyToken, verifyResetToken } = require("./jwt");
const { invalidRequest } = require("./errorFactory");

exports.generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

exports.generateResetToken = (payload) => {
  return generateToken({ ...payload, type: "password_reset" }, { expiresIn: "1m" });
};

exports.verifyResetToken = (token) => {
  const decoded = verifyResetToken(token);
  if (!decoded || decoded.type !== "password_reset" || !decoded.email) {
    throw invalidRequest("Invalid reset token");
  }

  return decoded;
};
