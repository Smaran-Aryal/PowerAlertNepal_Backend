const path = require("path");
const Report = require("../models/Report.model");
const imageService = require("./image.service");

const REPORT_IMAGE_DIR = path.join(process.cwd(), "uploads", "reports");

const resolveImageFilePath = (imageUrl) => {
  if (!imageUrl) return null;
  return path.join(REPORT_IMAGE_DIR, path.basename(imageUrl));
};

const buildReportFilter = (query = {}) => {
  const filter = {};

  if (query.district) filter.district = query.district;
  if (query.municipality) filter.municipality = query.municipality;
  if (query.province) filter.province = query.province;
  if (query.excludeRejected === "true") {
    filter.status = { $ne: "Rejected" };
  } else if (query.status) {
    filter.status = query.status;
  }
  if (query.outageType) filter.outageType = query.outageType;

  if (query.q) {
    filter.$text = { $search: query.q };
  }

  return filter;
};

const createReport = async (reportData, reportedById) => {
  const report = await Report.create({
    ...reportData,
    reportedBy: reportedById,
    status: "Pending",
  });

  return report;
};

const getReportById = async (id) => {
  const report = await Report.findById(id)
    .populate("reportedBy", "fullName")
    .populate("verifiedBy", "fullName");

  if (!report) {
    const error = new Error("Report not found");
    error.statusCode = 404;
    throw error;
  }

  return report;
};

const getReports = async (query = {}) => {
  const filter = buildReportFilter(query);

  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.max(parseInt(query.limit, 10) || 10, 1);
  const skip = (page - 1) * limit;

  const sortField = query.sortBy || "createdAt";
  const sortOrder = query.order === "asc" ? 1 : -1;

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .populate("reportedBy", "fullName")
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    Report.countDocuments(filter),
  ]);

  return {
    reports,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

const getMyReports = async (userId, query = {}) => {

  const filter = { ...buildReportFilter(query), reportedBy: userId };

  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.max(parseInt(query.limit, 10) || 10, 1);
  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    Report.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Report.countDocuments(filter),
  ]);

  return { reports, total, page, totalPages: Math.ceil(total / limit) };
};

const updateOwnReport = async (report, updates) => {
  if (report.status !== "Pending") {
    const error = new Error(
      "This report can no longer be edited because it has already been reviewed"
    );
    error.statusCode = 400;
    throw error;
  }

  const allowedFields = [
    "title",
    "description",
    "province",
    "district",
    "municipality",
    "ward",
    "latitude",
    "longitude",
    "outageType",
    "image",
  ];

  const oldImagePath =
    updates.image !== undefined && updates.image !== report.image
      ? report.image
      : null;

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      report[field] = updates[field];
    }
  });

  await report.save();

  if (oldImagePath) {
    await imageService.deleteUploadedFile(resolveImageFilePath(oldImagePath));
  }

  return report;
};

const deleteReport = async (report) => {
  const imagePath = report.image;

  await report.deleteOne();

  if (imagePath) {
    await imageService.deleteUploadedFile(resolveImageFilePath(imagePath));
  }
};

const verifyReport = async (reportId, adminId) => {
  const report = await getReportById(reportId);

  report.status = "Verified";
  report.verifiedBy = adminId;
  await report.save();

  return report;
};

const resolveReport = async (reportId, adminId, estimatedRestoreTime) => {
  const report = await getReportById(reportId);

  report.status = "Resolved";
  report.verifiedBy = adminId;
  if (estimatedRestoreTime) {
    report.estimatedRestoreTime = estimatedRestoreTime;
  }
  await report.save();

  return report;
};

const rejectReport = async (reportId, adminId, rejectionReason) => {
  const report = await getReportById(reportId);

  report.status = "Rejected";
  report.verifiedBy = adminId;
  report.rejectionReason = rejectionReason;
  await report.save();

  return report;
};

module.exports = {
  buildReportFilter,
  createReport,
  getReportById,
  getReports,
  getMyReports,
  updateOwnReport,
  deleteReport,
  verifyReport,
  resolveReport,
  rejectReport,
};