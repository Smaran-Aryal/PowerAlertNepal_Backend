const announcementService = require("../services/announcement.service");

const createAnnouncement = async (req, res, next) => {
  try {
    const announcementData = {
      title: req.body.title,
      content: req.body.content,
      isPublished: req.body.isPublished,
    };

    const announcement = await announcementService.createAnnouncement(
      announcementData,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: { announcement },
    });
  } catch (error) {
    next(error);
  }
};

const getAnnouncements = async (req, res, next) => {
  try {
    const result = await announcementService.getAnnouncements(req.query);

    return res.status(200).json({
      success: true,
      message: "Announcements fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAnnouncementById = async (req, res, next) => {
  try {
    const announcement = await announcementService.getAnnouncementById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Announcement fetched successfully",
      data: { announcement },
    });
  } catch (error) {
    next(error);
  }
};

const getPublishedAnnouncementById = async (req, res, next) => {
  try {
    const announcement = await announcementService.getPublishedAnnouncementById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Announcement fetched successfully",
      data: { announcement },
    });
  } catch (error) {
    next(error);
  }
};

const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await announcementService.updateAnnouncement(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Announcement updated successfully",
      data: { announcement },
    });
  } catch (error) {
    next(error);
  }
};


const deleteAnnouncement = async (req, res, next) => {
  try {
    await announcementService.deleteAnnouncement(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  getPublishedAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
};