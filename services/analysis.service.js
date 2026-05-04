const submissionModel = require("../models/submission.model");
const aiService = require("./ai.service");
const { sql, poolPromise } = require("../config/db");
const fs = require("fs/promises");
const path = require("path");
const AdmZip = require("adm-zip");



const analyzeSubmissionService = async (submissionId) => {

  // 1. Lấy code
  const submission = await submissionModel.getSubmission(submissionId);
  if (!submission) throw new Error("Không tìm thấy bài nộp");

  const { Code, Language } = submission;

  // 2. Tạo history
  const analysisId = await submissionModel.createAnalysis(submissionId);

  // 3. Lấy tiêu chí lỗi
  const categories = await submissionModel.getErrorCategories(Language);

  // 4. Gọi AI
  const { rawText } = await aiService.generateAnalysis({
    Code,
    Language,
    categories
  });

  // 5. Parse JSON
  let parsedErrors = [];
  try {
    const match = rawText.match(/\[[\s\S]*\]/);
    if (match) parsedErrors = JSON.parse(match[0]);
  } catch {
    console.log("Parse lỗi AI");
  }

  // 6. Lưu DB (transaction)
  await submissionModel.saveErrorsWithTransaction(submissionId, analysisId, parsedErrors);

  // 7. Update submission
  await submissionModel.updateSubmissionStatus(submissionId);

  return {
    success: true,
    analysisId,
    submissionId,
    issues: parsedErrors
  };
};
const getLanguageByExt = (filename) => {
    const ext = path.extname(filename).toLowerCase();
    const map = {
        '.cs': 'C#',
        '.js': 'JavaScript',
        '.py': 'Python',
        '.java': 'Java',
        '.cpp': 'C++',
        '.ts': 'TypeScript',
        '.php': 'PHP'
    };
    return map[ext] || 'Unknown';
};
// xử lý logic nộp file
const submitExerciseService = async (req) => {
    const file = req.file;
    const userId = req.user?.id;

    if (!file) {
        throw { status: 400, message: "Vui lòng chọn file code!" };
    }

    // 1. Check duplicate
    const isDuplicate = await submissionModel.checkDuplicate(file.originalname, userId);
    if (isDuplicate) {
        await fs.unlink(file.path);
        throw {
            status: 400,
            message: `Bạn đã nộp file "${file.originalname}" rồi`
        };
    }

    // 2. Check file type
    const fileExt = path.extname(file.originalname).toLowerCase();

    if (fileExt === '.rar') {
        await fs.unlink(file.path);
        throw { status: 400, message: "Không hỗ trợ .RAR" };
    }

    let detectedLang = getLanguageByExt(file.originalname);
    let codeContent = "";

    // 3. Xử lý file
        if (fileExt === ".zip") {
        const zip = new AdmZip(file.path);
        const entries = zip.getEntries();
        let combined = "";

        for (const entry of entries) {
            if (!entry.isDirectory && !entry.entryName.includes('__MACOSX')) {
                // Định dạng đồng nhất cho ZIP
                combined += `\n/* --- FILE: ${entry.entryName} --- */\n${entry.getData().toString("utf8")}\n`;

                if (detectedLang === 'Unknown') {
                    detectedLang = getLanguageByExt(entry.entryName);
                }
            }
        }
        codeContent = combined;
    } else {
        // SỬA TẠI ĐÂY: Thêm Header tên file cho cả file đơn
        const rawContent = await fs.readFile(file.path, "utf8");
        codeContent = `\n/* --- FILE: ${file.originalname} --- */\n${rawContent}\n`;
    }

    // 4. Lưu DB
    const submissionId = await submissionModel.insertSubmission({
        fileName: file.originalname,
        filePath: file.path,
        code: codeContent,
        language: detectedLang,
        userId
    });

    return {
        success: true,
        message: "Nộp bài thành công!",
        submissionId,
        language: detectedLang
    };
};


module.exports = {
  analyzeSubmissionService,
  submitExerciseService
};