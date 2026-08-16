const path = require("path");
const reportService = require("../services/report.service");
const imageService = require("../services/image.service");

const createReport = async (req, res, next) => {
    try {

        if (req.file) {
            await imageService.validateUploadedImage(req.file);
        }

        const imageUrl = req.file
            ? `/media/uploads/reports/${path.basename(req.file.path)}`
            : undefined;

        const reportData = {
            title: req.body.title,
            description: req.body.description,
            province: req.body.province,
            district: req.body.district,
            municipality: req.body.municipality,
            ward: req.body.ward,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            outageType: req.body.outageType,
            image: imageUrl,
        };

        const report = await reportService.createReport(reportData, req.user.id);

        return res.status(201).json({
            success: true,
            message: "Report submitted successfully",
            data: { report },
        });
    } catch (error) {
        next(error);
    }
};

const getReports = async (req, res, next) => {
    try {
        const result = await reportService.getReports(req.query);

        return res.status(200).json({
            success: true,
            message: "Reports fetched successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getReportById = async (req, res, next) => {
    try {
        const report = await reportService.getReportById(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Report fetched successfully",
            data: { report },
        });
    } catch (error) {
        next(error);
    }
};

const getMyReports = async (req, res, next) => {
    try {
        const result = await reportService.getMyReports(req.user.id, req.query);

        return res.status(200).json({
            success: true,
            message: "Your reports fetched successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const updateReport = async (req, res, next) => {
    try {
        if (req.file) {
            await imageService.validateUploadedImage(req.file);
        }

        const imageUrl = req.file
            ? `/media/uploads/reports/${path.basename(req.file.path)}`
            : undefined;

        const updates = {
            title: req.body.title,
            description: req.body.description,
            province: req.body.province,
            district: req.body.district,
            municipality: req.body.municipality,
            ward: req.body.ward,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            outageType: req.body.outageType,
            image: imageUrl,
        };

        const updatedReport = await reportService.updateOwnReport(
            req.report,
            updates
        );

        return res.status(200).json({
            success: true,
            message: "Report updated successfully",
            data: { report: updatedReport },
        });
    } catch (error) {
        next(error);
    }
};

const deleteReport = async (req, res, next) => {
    try {
        await reportService.deleteReport(req.report);

        return res.status(200).json({
            success: true,
            message: "Report deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

const verifyReport = async (req, res, next) => {
    try {
        const report = await reportService.verifyReport(req.params.id, req.user.id);

        return res.status(200).json({
            success: true,
            message: "Report marked as verified",
            data: { report },
        });
    } catch (error) {
        next(error);
    }
};

const resolveReport = async (req, res, next) => {
    try {
        const report = await reportService.resolveReport(
            req.params.id,
            req.user.id,
            req.body.estimatedRestoreTime
        );

        return res.status(200).json({
            success: true,
            message: "Report marked as resolved",
            data: { report },
        });
    } catch (error) {
        next(error);
    }
};

const rejectReport = async (req, res, next) => {
    try {
        const report = await reportService.rejectReport(
            req.params.id,
            req.user.id,
            req.body.rejectionReason
        );

        return res.status(200).json({
            success: true,
            message: "Report marked as rejected",
            data: { report },
        });
    } catch (error) {
        next(error);
    }
};

const adminDeleteReport = async (req, res, next) => {
    try {
        const report = await reportService.getReportById(req.params.id);
        await reportService.deleteReport(report);

        return res.status(200).json({
            success: true,
            message: "Report deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createReport,
    getReports,
    getReportById,
    getMyReports,
    updateReport,
    deleteReport,
    verifyReport,
    resolveReport,
    rejectReport,
    adminDeleteReport,
};