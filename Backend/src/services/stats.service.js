const Report = require("../models/Report.model");
const User = require("../models/User.model");

const getDateBoundaries = () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  return { startOfToday, sevenDaysAgo };
};

const getOverviewStats = async () => {
  const { startOfToday, sevenDaysAgo } = getDateBoundaries();

  const [
    totalUsers,
    totalReports,
    pendingReports,
    verifiedReports,
    resolvedReports,
    rejectedReports,
    reportsToday,
    reportsThisWeek,
    reportsByDistrict,
    recentReports,
  ] = await Promise.all([
    User.countDocuments(),
    Report.countDocuments(),
    Report.countDocuments({ status: "Pending" }),
    Report.countDocuments({ status: "Verified" }),
    Report.countDocuments({ status: "Resolved" }),
    Report.countDocuments({ status: "Rejected" }),
    Report.countDocuments({ createdAt: { $gte: startOfToday } }),
    Report.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Report.aggregate([
      { $group: { _id: "$district", count: { $sum: 1 } } },
      { $project: { _id: 0, district: "$_id", count: 1 } },
      { $sort: { district: 1 } },
    ]),
    Report.find()
      .populate("reportedBy", "fullName")
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  return {
    totalUsers,
    totalReports,
    pendingReports,
    verifiedReports,
    resolvedReports,
    rejectedReports,
    reportsToday,
    reportsThisWeek,
    reportsByDistrict,
    recentReports,
  };
};

const getPublicStats = async () => {
  const { startOfToday } = getDateBoundaries();

  const [
    totalActiveOutages,
    verifiedReports,
    resolvedReports,
    reportsToday,
    reportsByDistrict,
  ] = await Promise.all([
    Report.countDocuments({ status: { $in: ["Pending", "Verified"] } }),
    Report.countDocuments({ status: "Verified" }),
    Report.countDocuments({ status: "Resolved" }),
    Report.countDocuments({
      createdAt: { $gte: startOfToday },
      status: { $ne: "Rejected" },
    }),
    Report.aggregate([
      { $match: { status: { $ne: "Rejected" } } },
      { $group: { _id: "$district", count: { $sum: 1 } } },
      { $project: { _id: 0, district: "$_id", count: 1 } },
      { $sort: { district: 1 } },
    ]),
  ]);

  return {
    totalActiveOutages,
    verifiedReports,
    resolvedReports,
    reportsToday,
    reportsByDistrict,
  };
};

module.exports = {
  getOverviewStats,
  getPublicStats,
};