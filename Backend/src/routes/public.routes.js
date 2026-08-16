const express = require("express");
const reportController = require("../controllers/report.controller");
const noticeController = require("../controllers/notice.controller");
const announcementController = require("../controllers/announcement.controller");
const statsController = require("../controllers/stats.controller");

const router = express.Router();

const excludeRejectedByDefault = (req, res, next) => {
  req.query.excludeRejected = "true";
  next();
};

const publishedOnly = (req, res, next) => {
  req.query.publishedOnly = "true";
  next();
};

// ---------- Reports (public browse/search) ----------
router.get("/reports", excludeRejectedByDefault, reportController.getReports);
router.get("/reports/:id", reportController.getReportById);

// ---------- Maintenance notices ----------
router.get("/notices", noticeController.getNotices);
router.get("/notices/:id", noticeController.getNoticeById);

// ---------- Announcements ----------
router.get("/announcements", publishedOnly, announcementController.getAnnouncements);
router.get("/announcements/:id", announcementController.getPublishedAnnouncementById);

// ---------- Public statistics ----------
router.get("/stats", statsController.getPublicStats);

module.exports = router;