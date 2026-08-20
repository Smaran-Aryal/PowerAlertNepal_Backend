const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { OAuth2Client } = require("google-auth-library");
const { generateTokens } = require("../utils/generateTokens");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerUser = async ({ fullName, email, password, phone }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    fullName,
    email,
    password,
    phone,
    role: "citizen",
  });

  return user;
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
};