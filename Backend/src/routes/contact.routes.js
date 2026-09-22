const express = require("express");
const { submitContactForm } = require("../controllers/contact.controller");
const { otpRequestLimiter } = require("../middleware/rateLimit.middleware");

const router = express.Router();

router.post("/", otpRequestLimiter, submitContactForm);

module.exports = router;