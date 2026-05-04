const xlsx = require("xlsx");
const bcrypt = require("bcrypt");
const { poolPromise, sql } = require("../config/db");
const userModel = require("../models/user.model");

const importStudentsFromExcel = async (fileBuffer, classId) => {

    const workbook = xlsx.read(fileBuffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (data.length === 0) {
        throw new Error("File Excel rỗng");
    }

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    let inserted = 0;
    let updated = 0;

    await transaction.begin();

    try {
        const defaultPassword = await bcrypt.hash("123456", 10);

        for (let row of data) {

            const studentCode = row.studentCode?.toString().trim();
            const email = row.email?.trim();
            const fullName = row.fullName?.trim();

            if (!studentCode || !email) continue;

            const existing = await userModel.findUser(studentCode, email, transaction);

            if (existing.length > 0) {
                await userModel.updateClass(studentCode, email, classId, transaction);
                updated++;
            } else {
                await userModel.insertUser({
                    studentCode,
                    email,
                    fullName,
                    password: defaultPassword,
                    roleId: 2,
                    classId
                }, transaction);
                inserted++;
            }
        }

        await transaction.commit();

        return {
            inserted,
            updated,
            total: inserted + updated
        };

    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};

module.exports = {  
    importStudentsFromExcel
}