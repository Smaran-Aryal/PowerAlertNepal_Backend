// src/models/Report.model.js

const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
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
        province: {
            type: String,
            enum: ["Bagmati"],
            required: [true, "Province is required"],
        },
        district: {
            type: String,
            enum: ["Kathmandu", "Bhaktapur", "Lalitpur"],
            required: [true, "District is required"],
        },
        municipality: {
            type: String,
            required: [true, "Municipality is required"],
            trim: true,
        },
        ward: {
            type: Number,
            required: [true, "Ward number is required"],
            min: 1,
        },

        latitude: {
            type: Number,
            min: -90,
            max: 90,
        },

        longitude: {
            type: Number,
            min: -180,
            max: 180,
        },

        outageType: {
            type: String,
            enum: [
                "Unexpected Outage",
                "Scheduled Maintenance",
                "Transformer Damage",
                "Pole Damage",
                "Wire Damage",
                "Voltage Fluctuation",
            ],
            required: [true, "Outage type is required"],
        },

        status: {
            type: String,
            enum: ["Pending", "Verified", "Resolved", "Rejected"],
            default: "Pending",
        },

        estimatedRestoreTime: {
            type: Date,
        },

        image: {
            type: String,
        },

        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Reporter reference is required"],
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        rejectionReason: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);


reportSchema.index({ district: 1, status: 1 });


reportSchema.index({ outageType: 1, createdAt: -1 });


reportSchema.index({ title: "text", description: "text" });

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;