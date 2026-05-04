const { sql, poolPromise } = require("../config/db");
const feedbackService = require("../services/feedback.service");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const feedbackModel = require("../models/feedback.model");


const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.getFeedbackDraft = async (req, res) => {
    const { submissionId } = req.params;
    const teacherId = req.user.id;
    try {        
    const result = await feedbackService.getFeedbackDraftService(submissionId, teacherId);
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

exports.saveOfficialFeedback = async (req, res) => {
    const { submissionId, weakness, strengths, comment } = req.body;
    const teacherId = req.user.id;
    try {
        await feedbackModel.saveOficialFeedback(submissionId, teacherId, weakness, strengths, comment);
        res.json({ success: true, message: "Đã phê duyệt nhận xét!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// FeedbackController.js
exports.getAllClasses = async (req, res) => {
    try {
        const teacherId = req.user.id;

        const data = await feedbackModel.getAllClasses(teacherId);

        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getAllSubmissionsForAdmin = async (req, res) => {
    const { classId } = req.query;
    const teacherId = req.user.id;

    try {
        const data = await feedbackModel.getAllSubmissionsForAdmin(
            teacherId,
            classId
        );

        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getStudentNotifications = async (req , res) => {
    const userId = req.user.id;

    if(!userId){
        return res.status(401).json({
            success : false,
            message : "Không tìm thấy thông tin người dùng"
        })
    }

    try{
        const data = await feedbackModel.getStudentNotifications(userId);
        res.json({
            success : true , 
            count : data.length,
            data : data

        });
    }
    catch (err) {
        console.log("Lỗi thông báo của sinh viên :", err.message)
        res.status(500).json({
            success: false,
            message: "không thể lấy danh sách thông báo"
        });
    }
    
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await feedbackModel.markNotificationAsRead(id);
        res.json({ success: true, message: "Đã đánh dấu đã đọc" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

