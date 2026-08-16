const { body } = require("express-validator");

const registerValidationRules = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 3 })
    .withMessage("Full name must be at least 3 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .isMobilePhone("any")
    .withMessage("Phone number is invalid"),
];

const loginValidationRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

const refreshTokenValidationRules = [
  body("refreshToken")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Refresh token must be a string"),
];

module.exports = {
  registerValidationRules,
  loginValidationRules,
  refreshTokenValidationRules,
};