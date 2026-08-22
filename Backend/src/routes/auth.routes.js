const express = require("express");
const authController = require("../controllers/auth.controller");
const { otpRequestLimiter } = require("../middleware/rateLimit.middleware");
const validate = require("../middleware/validate.middleware");
const authenticate = require("../middleware/auth.middleware");
const {
    registerValidationRules,
    loginValidationRules,
    refreshTokenValidationRules,
} = require("../validators/auth.validator");

const router = express.Router();

router.post("/register", validate(registerValidationRules), authController.register);
router.post("/login", validate(loginValidationRules), authController.login);
router.post("/verify-email", authController.verifyEmail);
router.post("/resend-verification-otp", otpRequestLimiter, authController.resendVerificationOtp);
router.post("/google", authController.googleLogin);
router.post("/refresh", validate(refreshTokenValidationRules), authController.refresh);

router.post("/forgot-password", otpRequestLimiter, authController.forgotPassword);
router.post("/verify-reset-otp", authController.verifyResetOtp);
router.post("/reset-password", authController.resetPassword);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getProfile);

module.exports = router;
