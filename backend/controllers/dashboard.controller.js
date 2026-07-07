import dashboardService from "../services/dashboard.services.js";

const getAnalytics = async (req, res) => {
  try {
    res.json(await dashboardService.getAnalytics(req.user));
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Unable to load dashboard analytics.",
    });
  }
};

export default { getAnalytics };
