const MaintenanceNotice = require("../models/MaintenanceNotice.model");

const createNotice = async (noticeData, createdById) => {
  const notice = await MaintenanceNotice.create({
    ...noticeData,
    createdBy: createdById,
  });

  return notice;
};

const getNoticeById = async (id) => {
  const notice = await MaintenanceNotice.findById(id).populate(
    "createdBy",
    "fullName"
  );

  if (!notice) {
    const error = new Error("Maintenance notice not found");
    error.statusCode = 404;
    throw error;
  }

  return notice;
};

const getNotices = async (query = {}) => {
  const filter = {};
  if (query.district) filter.district = query.district;

  if (query.activeOnly === "true") {
    filter.scheduledEnd = { $gte: new Date() };
  }

  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.max(parseInt(query.limit, 10) || 10, 1);
  const skip = (page - 1) * limit;

  const [notices, total] = await Promise.all([
    MaintenanceNotice.find(filter)
      .sort({ scheduledStart: 1 })
      .skip(skip)
      .limit(limit),
    MaintenanceNotice.countDocuments(filter),
  ]);

  return {
    notices,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

const updateNotice = async (id, updates) => {
  const notice = await getNoticeById(id);

  const allowedFields = [
    "title",
    "description",
    "district",
    "municipality",
    "scheduledStart",
    "scheduledEnd",
  ];

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      notice[field] = updates[field];
    }
  });

  await notice.save();
  return notice;
};

const deleteNotice = async (id) => {
  const notice = await getNoticeById(id);
  await notice.deleteOne();
};

module.exports = {
  createNotice,
  getNoticeById,
  getNotices,
  updateNotice,
  deleteNotice,
};