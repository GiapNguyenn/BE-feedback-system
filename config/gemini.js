// 1. PHẢI CÓ DÒNG NÀY ĐẦU TIÊN để load Key từ file .env
require("dotenv").config(); 

const { GoogleGenerativeAI } = require("@google/generative-ai");

// 2. Kiểm tra xem Key đã load được chưa (để tránh lỗi 500/404 sau này)
if (!process.env.GEMINI_API_KEY) {
    console.error("LỖI: Chưa cấu hình GEMINI_API_KEY trong file .env");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 3. Khởi tạo Model (Dùng gemini-1.5-flash là ổn định nhất cho Key Free)
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
});

module.exports = model;