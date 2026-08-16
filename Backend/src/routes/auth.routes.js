const express = require("express");
const authController = require("../controllers/auth.controller");
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
router.post("/refresh", validate(refreshTokenValidationRules), authController.refresh);


router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getProfile);

module.exports = router;
