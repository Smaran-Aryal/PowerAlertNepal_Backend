const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { OAuth2Client } = require("google-auth-library");
const { generateTokens } = require("../utils/generateTokens");
const { generateOtp, hashOtp } = require("../utils/otp");
const { sendOtpEmail } = require("../utils/email");

const OTP_EXPIRY_MS = 10 * 60 * 1000;

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerUser = async ({ fullName, email, password, phone }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  const otp = generateOtp();

  const user = await User.create({
    fullName,
    email,
    password,
    phone,
    role: "citizen",
    isEmailVerified: false,
    emailOtpHash: hashOtp(otp),
    emailOtpExpires: new Date(Date.now() + OTP_EXPIRY_MS),
  });

  await sendOtpEmail({ to: email, otp, purpose: "verify-email" });

  return user;
};

const verifyEmail = async ({ email, otp }) => {
  const user = await User.findOne({ email }).select("+emailOtpHash +emailOtpExpires");

  if (!user) {
    const error = new Error("Invalid email or code");
    error.statusCode = 400;
    throw error;
  }

  if (user.isEmailVerified) {
    const error = new Error("Email is already verified");
    error.statusCode = 400;
    throw error;
  }

  if (!user.emailOtpHash || !user.emailOtpExpires || user.emailOtpExpires < new Date()) {
    const error = new Error("Code has expired. Please request a new one.");
    error.statusCode = 400;
    throw error;
  }

  if (hashOtp(otp) !== user.emailOtpHash) {
    const error = new Error("Invalid email or code");
    error.statusCode = 400;
    throw error;
  }

  user.isEmailVerified = true;
  user.emailOtpHash = undefined;
  user.emailOtpExpires = undefined;
  await user.save();

  return user;
};

const resendVerificationOtp = async ({ email }) => {
  const user = await User.findOne({ email });

  // Generic response regardless — don't reveal account existence
  if (!user || user.isEmailVerified) return;

  const otp = generateOtp();
  user.emailOtpHash = hashOtp(otp);
  user.emailOtpExpires = new Date(Date.now() + OTP_EXPIRY_MS);
  await user.save();

  await sendOtpEmail({ to: email, otp, purpose: "verify-email" });
};

const forgotPassword = async ({ email }) => {
  const user = await User.findOne({ email });

  // Generic response regardless — prevents account enumeration
  if (!user) return;

  const otp = generateOtp();
  user.resetOtpHash = hashOtp(otp);
  user.resetOtpExpires = new Date(Date.now() + OTP_EXPIRY_MS);
  await user.save();

  await sendOtpEmail({ to: email, otp, purpose: "reset-password" });
};

const verifyResetOtp = async ({ email, otp }) => {
  const user = await User.findOne({ email }).select("+resetOtpHash +resetOtpExpires");

  if (
    !user ||
    !user.resetOtpHash ||
    !user.resetOtpExpires ||
    user.resetOtpExpires < new Date() ||
    hashOtp(otp) !== user.resetOtpHash
  ) {
    const error = new Error("Invalid or expired code");
    error.statusCode = 400;
    throw error;
  }

  // Short-lived reset token (separate secret, 10 min expiry) — proves OTP was verified
  const resetToken = jwt.sign({ id: user._id, purpose: "password-reset" }, process.env.JWT_RESET_SECRET, {
    expiresIn: "10m",
  });

  return { resetToken };
};

const resetPassword = async ({ resetToken, newPassword }) => {
  let decoded;
  try {
    decoded = jwt.verify(resetToken, process.env.JWT_RESET_SECRET);
  } catch (err) {
    const error = new Error("Invalid or expired reset session. Please start over.");
    error.statusCode = 401;
    throw error;
  }

  if (decoded.purpose !== "password-reset") {
    const error = new Error("Invalid reset session");
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(decoded.id).select("+resetOtpHash +resetOtpExpires");
  if (!user) {
    const error = new Error("User no longer exists");
    error.statusCode = 401;
    throw error;
  }

  user.password = newPassword;
  user.resetOtpHash = undefined;
  user.resetOtpExpires = undefined;
  await user.save();
};

const loginUser = async ({ email, password }) => {

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("This account has been deactivated");
    error.statusCode = 403;
    throw error;
  }

  if (!user.isEmailVerified) {
    const error = new Error("Please verify your email before logging in");
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const { accessToken, refreshToken } = generateTokens(user);

  return { user, accessToken, refreshToken };
};

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    const error = new Error("Refresh token is required");
    error.statusCode = 401;
    throw error;
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    const error = new Error("Invalid or expired refresh token");
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    const error = new Error("User no longer exists or is inactive");
    error.statusCode = 401;
    throw error;
  }

  const tokens = generateTokens(user);
  return { user, ...tokens };
};

const googleLogin = async (idToken) => {
  if (!idToken) {
    const error = new Error("Google ID token is required");
    error.statusCode = 400;
    throw error;
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    const error = new Error("Invalid Google token");
    error.statusCode = 401;
    throw error;
  }

  const { sub: googleId, email, name, email_verified } = payload;

  if (!email_verified) {
    const error = new Error("Google email is not verified");
    error.statusCode = 401;
    throw error;
  }

  let user = await User.findOne({ googleId }).select("+googleId");

  if (!user) {

    const existingEmailUser = await User.findOne({ email });

    if (existingEmailUser) {

      const error = new Error(
        "An account already exists with this email. Please sign in using your email."
      );
      error.statusCode = 409;
      throw error;
    }

    user = await User.create({
      fullName: name || email.split("@")[0],
      email,
      googleId,
      authProvider: "google",
      role: "citizen",
      isActive: true,
      isEmailVerified: true,
    });
  }

  if (!user.isActive) {
    const error = new Error("This account has been deactivated");
    error.statusCode = 403;
    throw error;
  }

  const { accessToken, refreshToken } = generateTokens(user);

  return { user, accessToken, refreshToken };
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  googleLogin,
  verifyEmail,
  resendVerificationOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};