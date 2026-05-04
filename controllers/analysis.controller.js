const { sql, poolPromise } = require("../config/db");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const analysisModel = require("../models/analysis.model");
const chatService = require("../services/chat.service");

// src/server/controllers/analysisController.js

exports.getAnalysisHistory = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await analysisModel.getAnalysisHistory(id);

    if (!data) {
      return res.status(404).json({ message: "Không tìm thấy lịch sử phân tích" });
    }

    res.json({
      analysisId: data.analysisId,
      assignmentTitle: data.FileName,
      createdAt: data.createdAt,
      issues: JSON.parse(data.issuesJSON || "[]")
    });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
exports.chatAnalysis = async (req, res) => {
    const { analysisId } = req.params;
    const { question } = req.body;

    // validate
    if (!question || question.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Câu hỏi trống"
        });
    }

    try {
        const answer = await chatService.chatAnalysisService(
            analysisId,
            req.user.id,
            question
        );

        res.json({
            success: true,
            answer
        });

    } catch (err) {
        console.error("LỖI CHAT:", err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getAnalysisChat= async (req, res) => {
  const { analysisId } = req.params;

  try {
    const chatHistory = await analysisModel.getAnalysisChat(analysisId, req.user.id);
    res.json(chatHistory);
  } catch (err) {
    console.error("LỖI LẤY CHAT:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}