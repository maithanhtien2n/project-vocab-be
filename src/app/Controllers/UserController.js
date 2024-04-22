require("dotenv").config();

module.exports = (app) => {
  const { onResponse, checkNullRequest } = require("../Utils/index");
  const { onRouteCustom } = require("../Middlewares/index");

  const controllerName = "user";
  const onRoute = ({ route, role, isFee, methods, handler }) => {
    onRouteCustom({
      app,
      controllerName,
      methods,
      route,
      handler,
      role,
      isFee,
    });
  };

  // Service import
  const userService = require("../Services/UserService");

  // API lấy danh sách thông tin người dùng
  onRoute({
    route: "",
    role: "ADMIN",
    methods: "get",
    handler: async (req, res) => {
      try {
        const { tab, keySearch } = req.query;
        // Hàm xử lý logic và trả ra kết quả
        const result = await userService.getAllUser({ tab, keySearch });

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: "Lấy dữ liệu thành công!" });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
  });

  // API lấy thông tin người dùng
  onRoute({
    route: "detail",
    role: "USER",
    methods: "get",
    handler: async (req, res) => {
      try {
        // Hàm xử lý logic và trả ra kết quả
        const result = await userService.getOneUser(req.headers.accountid);

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: "Lấy dữ liệu thành công!" });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
  });

  // API lưu thông tin người dùng
  onRoute({
    route: "save",
    role: "USER",
    methods: "put",
    handler: async (req, res) => {
      try {
        // Các hàm xử lý request
        const request = checkNullRequest(
          { ...req.body, accountId: req.headers.accountid },
          ["accountId", "fullName", "gender", "dateOfBirth", "phoneNumber"]
        ); // Yêu cầu phải có các trường này trong body

        // Hàm xử lý logic và trả ra kết quả
        const result = await userService.saveUser({
          ...request,
          host: process.env.HOST_BE,
        });

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: "Lưu dữ liệu thành công!" });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
  });

  // API cập trạng thái người dùng
  onRoute({
    route: "update-status",
    role: "ADMIN",
    methods: "put",
    handler: async (req, res) => {
      try {
        // Các hàm xử lý request
        const request = checkNullRequest(req.body, ["ids", "status"]);

        // Hàm xử lý logic và trả ra kết quả
        const result = await userService.updateStatusAccount(request);

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({
          sttValue: `Cập nhật ${result} dữ liệu thành công!`,
        });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
  });

  // API nạp tiền cho người dùng
  onRoute({
    route: "topup",
    role: "ADMIN",
    methods: "put",
    handler: async (req, res) => {
      try {
        // Các hàm xử lý request
        const request = checkNullRequest(req.body, ["ids", "moneyNumber"]); // Yêu cầu phải có các trường này trong body

        // Hàm xử lý logic và trả ra kết quả
        const result = await userService.updateMoneyBalanceUser({
          ...request,
          host: process.env.HOST_BE,
        });

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({
          sttValue: `Cập nhật ${result} dữ liệu thành công!`,
        });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
  });

  // API lịch sử nạp tiền
  onRoute({
    route: "topup-history",
    role: "USER",
    methods: "put",
    handler: async (req, res) => {
      try {
        // Các hàm xử lý request
        const { keySearch } = req.query;

        // Hàm xử lý logic và trả ra kết quả
        const result = await userService.getTopUpHistory({
          accountId: req.headers.accountid,
          keySearch,
        });

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: "Lấy dữ liệu thành công!" });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
  });

  // Api xóa người dùng
  onRoute({
    route: "",
    role: "ADMIN",
    methods: "delete",
    handler: async (req, res) => {
      try {
        // Hàm xử lý logic và trả ra kết quả
        const result = await userService.delete(req.query.ids);

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({
          sttValue: `Xóa ${result} dữ liệu thành công!`,
        });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
  });

  // API thay đổi mô hình
  onRoute({
    route: "change-model",
    role: "USER",
    methods: "put",
    handler: async (req, res) => {
      try {
        // Các hàm xử lý request
        const request = checkNullRequest(req.query, ["isUpgrade"]);

        // Hàm xử lý logic và trả ra kết quả
        const result = await userService.changeModel({
          accountId: req.headers.accountid,
          ...request,
        });

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({
          sttValue: `Cập nhật dữ liệu thành công!`,
        });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
  });

  // API lấy danh sách tin nhắn
  onRoute({
    route: "messenger-list",
    role: "ADMIN",
    methods: "get",
    handler: async (req, res) => {
      try {
        // Hàm xử lý logic và trả ra kết quả
        const result = await userService.getMessengerList({
          keySearch: req.query.keySearch,
        });

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: "Lấy dữ liệu thành công!" });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
  });

  // API lấy chi tiết tin nhắn
  onRoute({
    route: "messenger-detail",
    role: "USER",
    methods: "get",
    handler: async (req, res) => {
      try {
        // Các hàm xử lý request
        const request = checkNullRequest(
          { accountId: req.headers.accountid, ...req.query },
          ["accountId"]
        );

        // Hàm xử lý logic và trả ra kết quả
        const result = await userService.getMessengerDetail({
          accountRole: req.data.role,
          ...request,
        });

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: "Lấy dữ liệu thành công!" });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
  });

  // API nhắn tin giữa user và admin
  onRoute({
    route: "messenger",
    role: "USER",
    methods: "post",
    handler: async (req, res) => {
      try {
        // Các hàm xử lý request
        const requiredFiles = ["content", "sendDate"];
        if (req.data.role === "ADMIN") {
          requiredFiles.push("accountId");
        }
        const request = checkNullRequest(req.body, requiredFiles);

        // Hàm xử lý logic và trả ra kết quả
        const result = await userService.sendMessenger({
          ...request,
          accountId:
            req.data.role === "ADMIN"
              ? req.body.accountId
              : req.headers.accountid,
          sender: req.data.role,
        });

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: "Gửi dữ liệu thành công!" });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
  });

  // API cập nhật đã xem tin nhắn
  onRoute({
    route: "update-is-read",
    role: "USER",
    methods: "put",
    handler: async (req, res) => {
      try {
        // Các hàm xử lý request
        const requiredFiles = [];
        if (req.data.role === "ADMIN") {
          requiredFiles.push("accountId");
        }
        const request = checkNullRequest(req.body, requiredFiles);

        // Hàm xử lý logic và trả ra kết quả
        const result = await userService.updateIsRead({
          ...request,
          accountId:
            req.data.role === "ADMIN"
              ? req.body.accountId
              : req.headers.accountid,
          sender: req.data.role,
        });

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({
          sttValue: "Cập nhật dữ liệu thành công!",
        });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
  });
};
