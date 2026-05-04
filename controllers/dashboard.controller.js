const { sql, poolPromise } = require("../config/db");
const dashboardModel = require("../models/dashboard.model");


// dashboardController.js
exports.getDashboardStats = async (req, res) => {
    try {
        const { id, role } = req.user; // Lấy từ authenticateToken
        
        const result = await dashboardModel.getDashboardStats(id, role);
            res.json({
                overview: result.recordsets[0]?.[0] || {},
                topErrors: result.recordsets[1] || [],
                recentSubmissions: result.recordsets[2] || [],
                languages: result.recordsets[3] || [],
                trends: result.recordsets[4] || []
            });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi Server" });
    }
};