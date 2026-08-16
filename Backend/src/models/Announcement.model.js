const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },

    // Allows admin to unpublish without deleting the record
    isPublished: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator reference is required"],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

announcementSchema.index({ isPublished: 1, createdAt: -1 });

const Announcement = mongoose.model("Announcement", announcementSchema);

module.exports = Announcement;