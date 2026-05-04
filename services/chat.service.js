const analysisModel = require("../models/analysis.model");
const aiService = require("./ai.service");

const chatAnalysisService = async (analysisId, userId, question) => {

    const context = await analysisModel.getContextByAnalysisId(analysisId);

    if (!context) {
        throw new Error("Không tìm thấy bài phân tích");
    }

    const fileName = context.FileName || "Tệp code";
    const language = context.Language || "Lập trình";
    const sourceCode = context.Code || "";

    await analysisModel.saveMessage(analysisId, userId, "user", question);

    const history = await analysisModel.getChatHistory(analysisId);

    const { cleanText } = await aiService.generateChat({
        fileName,
        language,
        sourceCode,
        history,
        question
    });

    await analysisModel.saveMessage(analysisId, userId, "ai", cleanText);

    return cleanText;
};
module.exports = {
    chatAnalysisService
};