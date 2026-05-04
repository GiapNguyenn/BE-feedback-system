const { GoogleGenerativeAI } = require("@google/generative-ai");
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateFeedback = async (errorMessages) => {
    const prompt = `
        Vai trò: Giảng viên CNTT.
        Danh sách lỗi:
      ${errorMessages.join("\n")}

        Nhiệm vụ: Phân tích bài làm của sinh viên.
        Ràng buộc: 
        - Chỉ trả về duy nhất định dạng JSON nén (minified). 
        - Không chào hỏi, không dùng markdown (không có \`\`\`json).
        - nếu không có lỗi nào, hãy trả về "Không phát hiện thấy lỗi nghiêm trọng nào" trong phần weakness.
        - Mỗi trường tối đa 30 từ.
        - Ngôn ngữ: Tiếng Việt.

        Cấu trúc JSON:
        {
        "weakness": "tóm tắt điểm yếu kiến thức",
        "strengths": "điểm tốt về kỹ năng/tư duy",
        "comment": "lời khuyên ngắn gọn để cải thiện"
        }
        `;
        const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
        const aiResponse = await model.generateContent(prompt);
        const text = aiResponse.response.text();
        const cleanJson = text.replace(/```json|```/g, "").trim();
        return { cleanJson };
}
const generateChat = async ({ fileName, language, sourceCode, history, question }) => {

      const chatHistory = history
        .map(m => `${m.role === "user" ? "User" : "AI"}: ${m.message}`)
        .join("\n");

         const prompt = `
            Bạn là chuyên gia lập trình hỗ trợ sinh viên sửa lỗi.
            NGỮ CẢNH:
            - Tệp: ${fileName} (${language})
            - Nội dung code: 
            \`\`\`
            ${sourceCode}
            \`\`\`

            LỊCH SỬ CHAT:
            ${chatHistory}

            NHIỆM VỤ:
            - Trả lời câu hỏi mới nhất của User một cách tự nhiên và ngắn gọn (1-3 dòng).
            - Nếu User hỏi về cách sửa lỗi cụ thể trong code trên:
                x Lỗi: (tên lỗi)
                => Gợi ý: (dòng code nên sửa)
            - Nếu User hỏi kiến thức chung hoặc hỏi thăm: Trả lời thân thiện, không cần định dạng lỗi.

            User: ${question}
            AI:`;

    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const answer = result.response.text();
    return { cleanText: answer };
}
const generateAnalysis = async ({ Code, Language, categories }) => {
    if (!Code) {
    throw new Error("Code is empty");
}
const prompt = `
Bạn là trợ lý sửa lỗi code chuyên nghiệp cho sinh viên (${Language}).

DỮ LIỆU ĐẦU VÀO:
- Code có thể chứa nhiều file gộp lại. 
- Mỗi file LUÔN bắt đầu bằng đánh dấu: /* --- FILE: tên_file --- */
- Bạn phải trích xuất chính xác "tên_file" từ dòng đánh dấu này để điền vào trường "file".

NHIỆM VỤ:
- Tìm lỗi dựa trên tiêu chí: ${categories}
- Chỉ báo lỗi khi CHẮC CHẮN sai. Nếu thiếu context (class cha, import...), hãy BỎ QUA.
- Quan trọng: Số dòng (line) phải được tính lại từ 1 cho mỗi file mới (dòng bắt đầu bằng /* --- FILE: ... --- */ coi như dòng 0).

YÊU CẦU TRẢ VỀ:
- Chỉ trả về duy nhất mảng JSON nén (minified), không có markdown (không có \`\`\`json).
- Ngôn ngữ: Tiếng Việt.

CẤU TRÚC JSON:
[
  {
    "file": "Tên file trích xuất được",
    "line": số_dòng_trong_file,
    "error": "[File: tên_file] + mô tả lỗi ngắn gọn",
    "fix": "Code_sai -> Giải thích ngắn -> Code_đúng"
  }
]

NỘI DUNG CODE CẦN PHÂN TÍCH:
${Code}
`;
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" }); // Đảm bảo model name đúng
    const aiResult = await model.generateContent(prompt);
    const answer = aiResult.response.text();
    const cleanText = answer.replace(/```json|```/g, "").trim();
    return { rawText: cleanText };
}

module.exports = {
    generateFeedback,
    generateChat,
    generateAnalysis
}
