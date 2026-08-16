const { body } = require("express-validator");

const ALLOWED_PROVINCES = ["Bagmati"];
const ALLOWED_DISTRICTS = ["Kathmandu", "Bhaktapur", "Lalitpur"];
const ALLOWED_OUTAGE_TYPES = [
  "Unexpected Outage",
  "Scheduled Maintenance",
  "Transformer Damage",
  "Pole Damage",
  "Wire Damage",
  "Voltage Fluctuation",
];

const createReportValidationRules = [
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

  body("province")
    .trim()
    .notEmpty()
    .withMessage("Province is required")
    .isIn(ALLOWED_PROVINCES)
    .withMessage(`Province must be one of: ${ALLOWED_PROVINCES.join(", ")}`),

  body("district")
    .trim()
    .notEmpty()
    .withMessage("District is required")
    .isIn(ALLOWED_DISTRICTS)
    .withMessage(`District must be one of: ${ALLOWED_DISTRICTS.join(", ")}`),

  body("municipality")
    .trim()
    .notEmpty()
    .withMessage("Municipality is required"),

  body("ward")
    .notEmpty()
    .withMessage("Ward number is required")
    .isInt({ min: 1 })
    .withMessage("Ward must be a positive integer"),

  body("latitude")
    .optional({ checkFalsy: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be a valid coordinate"),

  body("longitude")
    .optional({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be a valid coordinate"),

  body("outageType")
    .trim()
    .notEmpty()
    .withMessage("Outage type is required")
    .isIn(ALLOWED_OUTAGE_TYPES)
    .withMessage(`Outage type must be one of: ${ALLOWED_OUTAGE_TYPES.join(", ")}`),
];

const updateReportValidationRules = [
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

  body("province")
    .optional({ checkFalsy: true })
    .isIn(ALLOWED_PROVINCES)
    .withMessage(`Province must be one of: ${ALLOWED_PROVINCES.join(", ")}`),

  body("district")
    .optional({ checkFalsy: true })
    .isIn(ALLOWED_DISTRICTS)
    .withMessage(`District must be one of: ${ALLOWED_DISTRICTS.join(", ")}`),

  body("municipality")
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage("Municipality cannot be empty"),

  body("ward")
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Ward must be a positive integer"),

  body("latitude")
    .optional({ checkFalsy: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be a valid coordinate"),

  body("longitude")
    .optional({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be a valid coordinate"),

  body("outageType")
    .optional({ checkFalsy: true })
    .isIn(ALLOWED_OUTAGE_TYPES)
    .withMessage(`Outage type must be one of: ${ALLOWED_OUTAGE_TYPES.join(", ")}`),
];

const resolveReportValidationRules = [
  body("estimatedRestoreTime")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("estimatedRestoreTime must be a valid date"),
];

const rejectReportValidationRules = [
  body("rejectionReason")
    .trim()
    .notEmpty()
    .withMessage("A rejection reason is required")
    .isLength({ min: 5 })
    .withMessage("Rejection reason must be at least 5 characters"),
];

module.exports = {
  createReportValidationRules,
  updateReportValidationRules,
  resolveReportValidationRules,
  rejectReportValidationRules,
};