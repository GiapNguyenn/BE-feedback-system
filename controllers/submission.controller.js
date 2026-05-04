const db = require("../config/db");
const { sql, poolPromise } = require("../config/db");
const path = require("path");
const fs = require("fs").promises;
const analysisService = require("../services/analysis.service");
const submissionModel = require("../models/submission.model");
const AdmZip = require("adm-zip");

const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

//[httpPost]
exports.analyzeSubmission = async (req, res) => {
  const submissionId = parseInt(req.params.id);

  if (isNaN(submissionId)) {
    return res.status(400).json({ message: "ID không hợp lệ" });
  }

  try {
    const result = await analysisService.analyzeSubmissionService(submissionId);

    res.json(result);
  } catch (err) {
    console.error("LỖI:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.submitExercise = async (req, res) => {
    try {
        const result = await analysisService.submitExerciseService(req);

        res.status(201).json(result);
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({
            success: false,
            message: err.message
        });
    }
};
exports.getStudentSubmissions = async (req, res) => {
    try {
        const userId = req.user.id;

        const data = await submissionModel.getStudentSubmissions(userId);

        res.json({
            success: true,
            data: data
        });

    } catch (err) {
        console.error("Lỗi lấy danh sách:", err);

        res.status(500).json({
            message: "Không thể lấy danh sách bài nộp"
        });
    }
};
exports.togglePin = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await submissionModel.togglePin(id);

        res.json({
            success: true,
            message: "Cập nhật trạng thái ghim thành công",
            isPinned: result.IsPinned
        });

    } catch (err) {
        console.error("Toggle pin error:", err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.deleteSubmission = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const result = await submissionModel.deleteSubmission(id, userId);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bài nộp hoặc không có quyền xoá"
            });
        }

        res.json({
            success: true,
            message: "Đã xoá sạch dữ liệu bài nộp"
        });

    } catch (err) {
        console.error("LỖI XOÁ:", err);

        res.status(500).json({
            success: false,
            message: "Lỗi server: " + err.message
        });
    }
};
exports.getSubmissionDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await submissionModel.getSubmissionById(id);
        if (!data) return res.status(404).json({ success: false, message: "Không tìm thấy bài nộp" });
        
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getSubmissionCode = async (req, res) => {
    try {
        const { id } = req.params;
        // Ép kiểu ở đây hoặc truyền vào hàm rồi ép kiểu
        const data = await submissionModel.getSubmissionById(parseInt(id));

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bài nộp này!"
            });
        }

            res.status(200).json({
            success: true,
            // Chỉ trả về những thứ cần thiết cho việc xem code
            code: data.Code, 
            fileName: data.FileName,
            language : data.Language
        });

    } catch (error) {
        console.error("Lỗi Controller:", error);

        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi lấy dữ liệu code."
        });
    }
};