const { ObjectId } = require("mongodb");

module.exports = {
  onResponse: (res, result) => ({
    ok: (success) => {
      return res.status(200).json({
        success: true,
        statusCode: 200,
        statusValue: success?.sttValue || "OK!",
        executeDate: new Date(),
        data: result || null,
      });
    },
    badRequest: (fail) => {
      return res.status(fail?.sttCode && fail?.sttValue ? 400 : 500).json({
        success: false,
        statusCode: fail?.sttCode || "EXCEPTION",
        statusValue: fail?.sttValue || `Call api thất bại (${fail})`,
        executeDate: new Date(),
        data: null,
      });
    },
  }),

  checkNullRequest: (data, arrValue) => {
    let keys = [];

    for (const key of arrValue) {
      if ([undefined, null, ""].includes(data[key])) {
        keys.push(key);
      }
    }

    if (keys.length > 0) {
      throw {
        sttCode: "MISSING_REQUIRED_FIELDS",
        sttValue: `Lỗi thiếu trường bắt buộc: ${keys}`,
      };
    }

    return data;
  },

  throwError: (sttCode, sttValue) => {
    throw { sttCode, sttValue };
  },

  isObjectId: (value) => {
    try {
      new ObjectId(value);
      return true;
    } catch (error) {
      return false;
    }
  },

  cloneObjectWithoutFields: (originalObject, fieldsToRemove) => {
    const cloneUser = { ...originalObject };

    let data = {};

    for (const item of Object.keys(
      cloneUser?._doc ? cloneUser?._doc : cloneUser
    )) {
      if (!fieldsToRemove.includes(item)) {
        data[item] = originalObject[item];
      }
    }

    return data;
  },

  isValidEmail: (email) => {
    // Sử dụng biểu thức chính quy để kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);
  },
};
