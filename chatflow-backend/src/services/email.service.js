const nodemailer = require("nodemailer");
const AppError = require("../utils/AppError");
const { INTERNAL_SERVER_ERROR } = require("../constants/errorCodes");

const buildTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 587);
  const secure = process.env.EMAIL_SECURE === "true";
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !port || !user || !pass) {
    throw new AppError("SMTP email configuration is not set", 500, INTERNAL_SERVER_ERROR);
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  });
};

exports.sendForgotPasswordOtpEmail = async (email, otp) => {
  const transporter = buildTransporter();
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const subject = "Password reset code";
  const text = `Your password reset OTP is ${otp}. This code is valid for 5 minutes.`;
  const html = `<p>Your password reset OTP is <strong>${otp}</strong>.</p><p>This code is valid for 5 minutes.</p>`;

  await transporter.sendMail({
    from,
    to: email,
    subject,
    text,
    html
  });
  console.log(`Sent OTP email successfully to ${email}`);
};