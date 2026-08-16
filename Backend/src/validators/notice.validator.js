const { body } = require("express-validator");

const ALLOWED_DISTRICTS = ["Kathmandu", "Bhaktapur", "Lalitpur"]

const createNoticeValidationRules = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 150 })
    .withMessage("Title must be under 150 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),

  body("district")
    .trim()
    .notEmpty()
    .withMessage("District is required")
    .isIn(ALLOWED_DISTRICTS)
    .withMessage(`District must be one of: ${ALLOWED_DISTRICTS.join(", ")}`),

  body("municipality")
    .optional({ checkFalsy: true })
    .trim(),

  body("scheduledStart")
    .notEmpty()
    .withMessage("Scheduled start time is required")
    .isISO8601()
    .withMessage("scheduledStart must be a valid date"),

  body("scheduledEnd")
    .notEmpty()
    .withMessage("Scheduled end time is required")
    .isISO8601()
    .withMessage("scheduledEnd must be a valid date")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.scheduledStart)) {
        throw new Error("scheduledEnd must be after scheduledStart");
      }
      return true;
    }),
];

const updateNoticeValidationRules = [
  body("title")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage("Title must be under 150 characters"),

  body("description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),

  body("district")
    .optional({ checkFalsy: true })
    .isIn(ALLOWED_DISTRICTS)
    .withMessage(`Service not available for now choose: ${ALLOWED_DISTRICTS.join(", ")}`),

  body("municipality")
    .optional({ checkFalsy: true })
    .trim(),

  body("scheduledStart")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("scheduledStart must be a valid date"),

  body("scheduledEnd")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("scheduledEnd must be a valid date")
    .custom((value, { req }) => {
      if (req.body.scheduledStart && new Date(value) <= new Date(req.body.scheduledStart)) {
        throw new Error("scheduledEnd must be after scheduledStart");
      }
      return true;
    }),
];

module.exports = {
  createNoticeValidationRules,
  updateNoticeValidationRules,
};