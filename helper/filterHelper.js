// src/helper/filterHelper.js
module.exports = (query, allowedFields = []) => {
    let filterObject = {
        whereClause: "",
        params: [] // Lưu cặp { name, type, value } để nạp vào request.input
    };

    const conditions = [];

    // Duyệt qua các allowedFields (các cột cho phép lọc, ví dụ: 'level')
    allowedFields.forEach(field => {
        if (query[field] && query[field].trim() !== "") {
            conditions.push(`L.${field} = @${field}`);
            filterObject.params.push({
                name: field,
                value: query[field].trim()
            });
        }
    });

    if (conditions.length > 0) {
        filterObject.whereClause = `WHERE ${conditions.join(" AND ")}`;
    }

    return filterObject;
};