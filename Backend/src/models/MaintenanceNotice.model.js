const mongoose = require("mongoose");

const maintenanceNoticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    district: {
      type: String,
      enum: ["Kathmandu", "Bhaktapur", "Lalitpur"],
      required: [true, "District is required"],
    },
    municipality: {
      type: String,
      trim: true,
    },

    scheduledStart: {
      type: Date,
      required: [true, "Scheduled start time is required"],
    },
    scheduledEnd: {
      type: Date,
      required: [true, "Scheduled end time is required"],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator reference is required"],
    },
  },
  {
    timestamps: true, 
  }
);

// Supports filtering/listing notices by district, ordered by schedule
maintenanceNoticeSchema.index({ district: 1, scheduledStart: 1 });

const MaintenanceNotice = mongoose.model(
  "MaintenanceNotice",
  maintenanceNoticeSchema
);

module.exports = MaintenanceNotice;