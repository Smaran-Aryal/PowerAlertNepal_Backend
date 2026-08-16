const noticeService = require("../services/notice.service");

const createNotice = async (req, res, next) => {
  try {
    const noticeData = {
      title: req.body.title,
      description: req.body.description,
      district: req.body.district,
      municipality: req.body.municipality,
      scheduledStart: req.body.scheduledStart,
      scheduledEnd: req.body.scheduledEnd,
    };

    const notice = await noticeService.createNotice(noticeData, req.user.id);

    return res.status(201).json({
      success: true,
      message: "Maintenance notice created successfully",
      data: { notice },
    });
  } catch (error) {
    next(error);
  }
};

const getNotices = async (req, res, next) => {
  try {
    const result = await noticeService.getNotices(req.query);

    return res.status(200).json({
      success: true,
      message: "Maintenance notices fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getNoticeById = async (req, res, next) => {
  try {
    const notice = await noticeService.getNoticeById(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Maintenance notice fetched successfully",
      data: { notice },
    });
  } catch (error) {
    next(error);
  }
};

const updateNotice = async (req, res, next) => {
  try {
    const notice = await noticeService.updateNotice(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: "Maintenance notice updated successfully",
      data: { notice },
    });
  } catch (error) {
    next(error);
  }
};

const deleteNotice = async (req, res, next) => {
  try {
    await noticeService.deleteNotice(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Maintenance notice deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNotice,
  getNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
};
