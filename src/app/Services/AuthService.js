require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { throwError, cloneObjectWithoutFields } = require("../Utils/index");
const { uploadFile, getById } = require("./CommonService");

const { Account } = require("../Models/Account");

module.exports = {
  register: async ({ fullName, dayOfBirth, email, password }) => {
    try {
      const account = await Account.findOne({ email });

      if (account && account?.password) {
        throwError("EMAIL_ALREADY_USED", "Email này đã được sử dụng!");
      }

      await Account.create({
        fullName,
        dayOfBirth,
        email,
        password: bcrypt.hashSync(password, 10),
      });

      return email;
    } catch (error) {
      throw error;
    }
  },

  login: async ({ email, password }) => {
    try {
      let account = await Account.findOne({ email });

      if (
        !account ||
        (account && !account?.password) ||
        !bcrypt.compareSync(password, account.password)
      ) {
        throwError(
          "INCORRECT_INFO",
          "Tên tài khoản hoặc mật khẩu không chính xác!"
        );
      }

      return {
        userData: cloneObjectWithoutFields(account, [
          "password",
          "createdAt",
          "updatedAt",
          "__v",
        ]),
        accessToken: jwt.sign(
          cloneObjectWithoutFields(account, [
            "password",
            "createdAt",
            "updatedAt",
            "__v",
          ]),
          process.env.JWT_SECRET,
          { expiresIn: "12h" }
        ),
      };
    } catch (error) {
      throw error;
    }
  },

  getUserInfo: async (id) => {
    try {
      const result = await Account.findById(id).select("-password -role");
      return result;
    } catch (error) {
      throw error;
    }
  },

  saveUserInfo: async (data) => {
    try {
      const userId = (await Account.findById(data.accountId))._id;

      const fieldImage = "avatar";
      let infoData = { ...data };
      if (!data[fieldImage] || data[fieldImage].base64.includes("http")) {
        infoData.avatar = null;
      }

      const updateUser = await uploadFile(
        Account,
        { field: fieldImage, location: "images/" },
        userId,
        infoData
      );

      return updateUser;
    } catch (error) {
      throw error;
    }
  },
};
