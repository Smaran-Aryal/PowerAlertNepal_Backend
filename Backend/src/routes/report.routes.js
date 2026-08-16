const express = require("express");
const reportController = require("../controllers/report.controller");
const authenticate = require("../middleware/auth.middleware");
const checkReportOwnership = require("../middleware/ownership.middleware");
const validate = require("../middleware/validate.middleware");
const upload = require("../middleware/upload.middleware");
const {
  createReportValidationRules,
  updateReportValidationRules,
} = require("../validators/report.validator");

const router = express.Router();

router.use(authenticate);

router.post(
  "/",
  upload.single("image"),
  validate(createReportValidationRules),
  reportController.createReport
);

router.get("/mine", reportController.getMyReports);

router.put(
  "/:id",
  checkReportOwnership,
  upload.single("image"),
  validate(updateReportValidationRules),
  reportController.updateReport
);

router.delete("/:id", checkReportOwnership, reportController.deleteReport);

module.exports = router;