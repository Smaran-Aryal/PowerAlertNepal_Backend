const Announcement = require("../models/Announcement.model");

const createAnnouncement = async (announcementData, createdById) => {
    const announcement = await Announcement.create({
        ...announcementData,
        createdBy: createdById,
    });

    return announcement;
};

const getAnnouncementById = async (id) => {
    const announcement = await Announcement.findById(id).populate(
        "createdBy",
        "fullName"
    );

    if (!announcement) {
        const error = new Error("Announcement not found");
        error.statusCode = 404;
        throw error;
    }

    return announcement;
};

const getPublishedAnnouncementById = async (id) => {
    const announcement = await Announcement.findOne({
        _id: id,
        isPublished: true,
    }).populate("createdBy", "fullName");

    if (!announcement) {
        const error = new Error("Announcement not found");
        error.statusCode = 404;
        throw error;
    }

    return announcement;
};

const getAnnouncements = async (query = {}) => {
    const filter = {};

    if (query.publishedOnly === "true") {
        filter.isPublished = true;
    } else if (query.isPublished !== undefined) {
        filter.isPublished = query.isPublished === "true";
    }

    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(query.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;

    const [announcements, total] = await Promise.all([
        Announcement.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Announcement.countDocuments(filter),
    ]);

    return {
        announcements,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
};

const updateAnnouncement = async (id, updates) => {
    const announcement = await getAnnouncementById(id);

    const allowedFields = ["title", "content", "isPublished"];

    allowedFields.forEach((field) => {
        if (updates[field] !== undefined) {
            announcement[field] = updates[field];
        }
    });

    await announcement.save();
    return announcement;
};

const deleteAnnouncement = async (id) => {
    const announcement = await getAnnouncementById(id);
    await announcement.deleteOne();
};

module.exports = {
    createAnnouncement,
    getAnnouncementById,
    getPublishedAnnouncementById,
    getAnnouncements,
    updateAnnouncement,
    deleteAnnouncement,
};