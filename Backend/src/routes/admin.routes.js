const express = require("express");
const reportController = require("../controllers/report.controller");
const adminController = require("../controllers/admin.controller");
const noticeController = require("../controllers/notice.controller");
const announcementController = require("../controllers/announcement.controller");
const statsController = require("../controllers/stats.controller");
const authenticate = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");
const {
  resolveReportValidationRules,
  rejectReportValidationRules,
} = require("../validators/report.validator");
const {
  createNoticeValidationRules,
  updateNoticeValidationRules,
} = require("../validators/notice.validator");
const {
  createAnnouncementValidationRules,
  updateAnnouncementValidationRules,
} = require("../validators/announcement.validator");

const router = express.Router();

router.use(authenticate, requireRole("admin"));

router.get("/stats", statsController.getOverviewStats);

router.get("/reports", reportController.getReports);
router.get("/reports/:id", reportController.getReportById);
router.patch("/reports/:id/verify", reportController.verifyReport);
router.patch(
  "/reports/:id/resolve",
  validate(resolveReportValidationRules),
  reportController.resolveReport
);
router.patch(
  "/reports/:id/reject",
  validate(rejectReportValidationRules),
  reportController.rejectReport
);
router.delete("/reports/:id", reportController.adminDeleteReport);

router.get("/users", adminController.getAllUsers);
router.patch("/users/:id/deactivate", adminController.deactivateUser);

router.post(
  "/notices",
  validate(createNoticeValidationRules),
  noticeController.createNotice
);
router.put(
  "/notices/:id",
  validate(updateNoticeValidationRules),
  noticeController.updateNotice
);
router.delete("/notices/:id", noticeController.deleteNotice);

router.get("/announcements", announcementController.getAnnouncements);
router.get("/announcements/:id", announcementController.getAnnouncementById);
router.post(
  "/announcements",
  validate(createAnnouncementValidationRules),
  announcementController.createAnnouncement
);
router.put(
  "/announcements/:id",
  validate(updateAnnouncementValidationRules),
  announcementController.updateAnnouncement
);
router.delete("/announcements/:id", announcementController.deleteAnnouncement);

module.exports = router;