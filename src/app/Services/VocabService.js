require("dotenv").config();

const { cloneObjectWithoutFields, throwError } = require("../Utils/index");
const { uploadFile, getById } = require("./CommonService");

const { Vocab } = require("../Models/Vocab");

module.exports = {
  getAllVocab: async () => {
    try {
      //
      return result;
    } catch (error) {
      throw error;
    }
  },
};
