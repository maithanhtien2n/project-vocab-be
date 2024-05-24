require("dotenv").config();

module.exports = (app) => {
  const {
    onResponse,
    checkNullRequest,
    cloneObjectWithoutFields,
  } = require("../Utils/index");
  const { onRouteCustom } = require("../Middlewares/index");

  const controllerName = "vocab";
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
  const vocabService = require("../Services/VocabService");

  // API lấy vocab
  onRoute({
    route: "",
    role: "USER",
    methods: "get",
    handler: async (req, res) => {
      try {
        // Hàm xử lý logic và trả ra kết quả
        const result = await vocabService.getAllVocab({
          accountId: req.data._id,
          classRoomId: req.query.classRoomId,
        });

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: "Lấy dữ liệu thành công!" });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
  });

  // API lấy chi tiết vocab
  onRoute({
    route: ":id",
    role: "USER",
    methods: "get",
    handler: async (req, res) => {
      try {
        // Hàm xử lý logic và trả ra kết quả
        const result = await vocabService.getByIdVocab(req.params.id);

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: "Lấy dữ liệu thành công!" });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
  });

  // API tạo vocab
  onRoute({
    route: "",
    role: "USER",
    methods: "post",
    handler: async (req, res) => {
      try {
        // Các hàm xử lý request
        const request = checkNullRequest(req.body, [
          "classRoomId",
          "title",
          "translateTitle",
        ]);

        // Hàm xử lý logic và trả ra kết quả
        const result = await vocabService.createVocab({
          accountId: req.data._id,
          ...request,
        });

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: "Tạo dữ liệu thành công!" });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
  });

  // API cập nhật vocab
  onRoute({
    route: ":id",
    role: "USER",
    methods: "put",
    handler: async (req, res) => {
      try {
        // Các hàm xử lý request
        const request = checkNullRequest(req.body, [
          "classRoomId",
          "title",
          "translateTitle",
        ]);

        // Hàm xử lý logic và trả ra kết quả
        const result = await vocabService.updateVocab(req.params.id, {
          accountId: req.data._id,
          ...request,
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

  // API delete vocab
  onRoute({
    route: "",
    role: "USER",
    methods: "delete",
    handler: async (req, res) => {
      try {
        const request = checkNullRequest(req.body, ["ids"]);

        // Hàm xử lý logic và trả ra kết quả
        const result = await vocabService.deleteVocab(request);

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({
          sttValue: `Xóa ${result} dữ liệu thành công!`,
        });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
  });
};
