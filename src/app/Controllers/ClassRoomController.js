require("dotenv").config();

module.exports = (app) => {
  const {
    onResponse,
    checkNullRequest,
    cloneObjectWithoutFields,
  } = require("../Utils/index");
  const { onRouteCustom } = require("../Middlewares/index");

  const controllerName = "class-rooms";
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
  const classRoom = require("../Services/ClassRoom");

  // API lấy danh sách phòng
  onRoute({
    route: "my-class-room",
    role: "USER",
    methods: "get",
    handler: async (req, res) => {
      try {
        const { accountId, type } = req.query;

        // Hàm xử lý logic và trả ra kết quả
        const result = await classRoom.getAllClassRoom({ accountId, type });

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: "Lấy dữ liệu thành công!" });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
  });

  // API lưu phòng học
  onRoute({
    route: "",
    role: "USER",
    methods: "put",
    handler: async (req, res) => {
      try {
        // Các hàm xử lý request
        let request = checkNullRequest(req.body, [
          "accountId",
          "roomName",
          "description",
          "author",
        ]);
        if (!request.numberOfUsers) {
          request.numberOfUsers = 1000;
        }

        // Hàm xử lý logic và trả ra kết quả
        const result = await classRoom.saveClassRoom(req.query.classRoomId, {
          ...cloneObjectWithoutFields(request, ["_id"]),
          host: process.env.HOST_BE,
        });

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: "Lưu dữ liệu thành công!" });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
  });

  // API lưu phòng học
  onRoute({
    route: ":id",
    role: "USER",
    methods: "get",
    handler: async (req, res) => {
      try {
        // Hàm xử lý logic và trả ra kết quả
        const result = await classRoom.getByIdClassRoom(req.params.id);

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: "Lấy liệu thành công!" });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
  });

  // Api xóa phòng học
  onRoute({
    route: ":id",
    role: "USER",
    methods: "delete",
    handler: async (req, res) => {
      try {
        // Hàm xử lý logic và trả ra kết quả
        const result = await classRoom.deleteClassRoom(req.params.id);

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({
          sttValue: `Xóa phòng thành công!`,
        });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
  });

  // Api tham gia vào phòng
  onRoute({
    route: "join",
    role: "USER",
    methods: "put",
    handler: async (req, res) => {
      try {
        const { accountId, classRoomId, password } = req.query;

        // Hàm xử lý logic và trả ra kết quả
        const result = await classRoom.joinClassRoom({
          accountId,
          classRoomId,
          password,
        });

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({
          sttValue: `Vào phòng thành công!`,
        });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
  });

  // Api check xem phòng có password không
  onRoute({
    route: "is-password",
    role: "USER",
    methods: "put",
    handler: async (req, res) => {
      try {
        const { classRoomId } = req.query;

        // Hàm xử lý logic và trả ra kết quả
        const result = await classRoom.checkRoomPassword({ classRoomId });

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: `Kiểm tra thành công!` });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
  });
};
