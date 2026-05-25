const dashboardModel = require('../models/dashboard.model');

exports.getDashboardStats = async (req, res) => {
    try {
        const { id, role } = req.user;
        const classId = req.query.classId ? parseInt(req.query.classId) : null;

        const result = await dashboardModel.getDashboardStats(id, role, classId);

        if (role.toLowerCase() === 'admin') {
            return res.json({
                overview:           result.recordsets[0]?.[0] || {},
                topErrors:          result.recordsets[1] || [],
                recentSubmissions:  result.recordsets[2] || [],
                languages:          result.recordsets[3] || [],
                trends:             result.recordsets[4] || [],
                teachers:           result.recordsets[5] || [],  
            });
        }

        // teacher
        return res.json({
            overview:           result.recordsets[0]?.[0] || {},
            topStudentErrors:   result.recordsets[1] || [],
            pendingSubmissions: result.recordsets[2] || [], 
            languages:          result.recordsets[3] || [],
            classTrends:        result.recordsets[4] || [],
            classes:            result.recordsets[5] || [],
        });

    } catch (err) {
        console.error('Dashboard error:', err);
        res.status(500).json({ message: 'Lỗi Server' });
    }
};