const { body } = require("express-validator");

const createAnnouncementValidationRules = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 150 })
    .withMessage("Title must be under 150 characters"),

  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 10 })
    .withMessage("Content must be at least 10 characters"),

  body("isPublished")
    .optional()
    .isBoolean()
    .withMessage("isPublished must be a boolean"),
];

const updateAnnouncementValidationRules = [
  body("title")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage("Title must be under 150 characters"),

  body("content")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 10 })
    .withMessage("Content must be at least 10 characters"),

  body("isPublished")
    .optional()
    .isBoolean()
    .withMessage("isPublished must be a boolean"),
];

module.exports = {
  createAnnouncementValidationRules,
  updateAnnouncementValidationRules,
};