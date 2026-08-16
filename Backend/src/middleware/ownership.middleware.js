const Report = require("../models/Report.model");

const checkReportOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    const isOwner = report.reportedBy.toString() === req.user.id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to modify this report",
      });
    }

    req.report = report;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkReportOwnership;