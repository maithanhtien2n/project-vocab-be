const jwt = require("jsonwebtoken");
require("dotenv").config();
const { throwError } = require("../Utils/index");

module.exports = ({ role, isFee }) => ({
  authenticateToken: async (req, res, next) => {
    try {
      if (role === "NO_AUTH") {
        return next();
      }

      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        throwError(
          "LOGIN_REQUEST",
          "Vui lòng đăng nhập để sử dụng tính năng này!"
        );
      }

      try {
        const data = await jwt.verify(token, process.env.JWT_SECRET);

        req.data = data;

        next();
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          throwError("LOGIN_EXPIRED", "Phiên đăng nhập đã hết hạn!");
        } else if (error.name === "JsonWebTokenError") {
          throwError("AUTH_ERROR", "Token không hợp lệ!");
        } else {
          throw error;
        }
      }
    } catch (error) {
      return res.status(error?.sttCode && error?.sttValue ? 400 : 500).json({
        success: false,
        statusCode: error?.sttCode || "AUTH_FAILED",
        statusValue: error?.sttValue || `Xác thực token thất bại (${error})`,
        data: null,
      });
    }
  },
});
