require("dotenv").config();

module.exports = (app) => {
  const {
    onResponse,
    checkNullRequest,
    isValidEmail,
    throwError,
  } = require("../Utils/index");

  const controllerName = "auth";
  const onRoute = (method, route, handler) => {
    app[method](`/api/v1/${controllerName}/${route}`, handler);
  };

  // Service import
  const authService = require("../Services/AuthService");

  // API đăng ký tài khoản
  onRoute("post", "register", async (req, res) => {
    try {
      // Các hàm xử lý request
      const request = checkNullRequest(req.body, [
        "fullName",
        "dayOfBirth",
        "email",
        "password",
        "passwordConfirm",
      ]);

      if (!isValidEmail(request.email)) {
        throwError("INVALID_EMAIL", "Lỗi email không hợp lệ!");
      }

      // Hàm xử lý logic và trả ra kết quả
      const result = await authService.register(request);

      // Hàm trả về response cho người dùng
      onResponse(res, result).ok({ sttValue: "Đăng ký tài khoản thành công!" });
    } catch (error) {
      onResponse(res, null).badRequest(error);
    }
  });

  // API đăng nhập
  onRoute("post", "login", async (req, res) => {
    try {
      // Các hàm xử lý request
      const request = checkNullRequest(req.body, ["email", "password"]);

      if (!isValidEmail(request.email)) {
        throwError("INVALID_EMAIL", "Lỗi email không hợp lệ!");
      }

      // Hàm xử lý logic và trả ra kết quả
      const result = await authService.login(request);

      // Hàm trả về response cho người dùng
      onResponse(res, result).ok({ sttValue: "Đăng nhập thành công!" });
    } catch (error) {
      onResponse(res, null).badRequest(error);
    }
  });

  // API Lấy thông tin người dùng
  onRoute("get", "user-info/:id", async (req, res) => {
    try {
      // Hàm xử lý logic và trả ra kết quả
      const result = await authService.getUserInfo(req.params.id);

      // Hàm trả về response cho người dùng
      onResponse(res, result).ok({ sttValue: "Lấy thông tin thành công!" });
    } catch (error) {
      onResponse(res, null).badRequest(error);
    }
  });

  // API lưu thông tin người dùng
  onRoute("put", "save-user-info", async (req, res) => {
    try {
      // Các hàm xử lý request
      const request = checkNullRequest(req.body, [
        "accountId",
        "fullName",
        "phoneNumber",
        "dayOfBirth",
      ]);

      // Hàm xử lý logic và trả ra kết quả
      const result = await authService.saveUserInfo({
        ...request,
        host: process.env.HOST_BE,
      });

      // Hàm trả về response cho người dùng
      onResponse(res, result).ok({ sttValue: "Lấy thông tin thành công!" });
    } catch (error) {
      onResponse(res, null).badRequest(error);
    }
  });
};
