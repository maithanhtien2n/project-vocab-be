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

  // API lấy danh sách phòng
  onRoute({
    route: "",
    role: "USER",
    methods: "get",
    handler: async (req, res) => {
      try {
        const { accountId, type } = req.query;

        // Hàm xử lý logic và trả ra kết quả
        const result = await vocabService.getAllVocab({ accountId, type });

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: "Lấy dữ liệu thành công!" });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
  });
};
