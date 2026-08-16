const statsService = require("../services/stats.service");

const getOverviewStats = async (req, res, next) => {
    try {
        const stats = await statsService.getOverviewStats();

        return res.status(200).json({
            success: true,
            message: "Dashboard statistics fetched successfully",
            data: { stats },
        });
    } catch (error) {
        next(error);
    }
};

const getPublicStats = async (req, res, next) => {
    try {
        const stats = await statsService.getPublicStats();

        return res.status(200).json({
            success: true,
            message: "Public statistics fetched successfully",
            data: { stats },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getOverviewStats,
    getPublicStats,
};

