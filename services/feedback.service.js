const feedbackModel = require('../models/feedback.model');
const aiService = require('./ai.service');

const getFeedbackDraftService = async (submissionId, teacherId) => {
    // 1. check draft cú 
    try {
        const existingDraft = await feedbackModel.getExistingDraft(submissionId);
        const existing = await feedbackModel.getExistingDraft(submissionId);
        if (existing.length > 0 && existing[0].AIDraft) {
            return {
                success: true,
                draft: typeof existing[0].AIDraft === 'string' 
                        ? JSON.parse(existing[0].AIDraft) 
                        : existing[0].AIDraft,
                isOldDraft: true
            };
        }
        
        // 2. Lấy lỗi
        const errorMessages = await feedbackModel.getErrorMessages(submissionId);
        let errors = errorMessages.map(e => e.Message);
        if (errors.length === 0) {
            errors = ["Không phát hiện thấy lỗi nghiêm trọng nào"];
        }

        // 3. Gọi AI
        const {cleanJson} = await aiService.generateFeedback(errors);
        const parsed = JSON.parse(cleanJson);

        // 4. Lưu Db
        await feedbackModel.upsertFeedback(submissionId, teacherId, cleanJson, parsed);
        return {draft : parsed};

    } catch (error) {
        console.error("LỖI TẠI SERVICE:", error); // Dòng này sẽ cứu bạn!
        throw error; // Ném ra để Controller bắt được lỗi 500
    }

};
module.exports = {
    getFeedbackDraftService
};