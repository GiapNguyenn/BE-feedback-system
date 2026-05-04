const logModel = require("../models/log.model");
const paginationHelper = require("../helper/paginationHelper");
const filterHelper = require("../helper/filterHelper"); // 1. Import helper mới

exports.getSystemLogs = async (req, res) => {
    try {
        // 2. Dùng helper để lấy điều kiện lọc (cho phép lọc theo cột 'level')
        const filter = filterHelper(req.query, ["level"]);

        // 3. Tính tổng số log dựa trên filter
        const totalLogs = await logModel.countLogs(filter); 

        let objectPagination = {
            currentPage: 1,
            limitItems: 10
        };
        objectPagination = paginationHelper(objectPagination, req.query, totalLogs);

        // 4. Lấy dữ liệu với filter
        const logs = await logModel.getLogs(objectPagination.limitItems, objectPagination.skip, filter);

        res.json({
            success: true,
            data: logs,
            pagination: {
                currentPage: objectPagination.currentPage,
                totalPage: objectPagination.totalPage,
                totalItems: totalLogs
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};