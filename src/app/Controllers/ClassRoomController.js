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
  const classRoomService = require("../Services/ClassRoomService");

  // API lấy danh sách phòng
  onRoute({
    route: "my-class-room",
    role: "USER",
    methods: "get",
    handler: async (req, res) => {
      try {
        // Hàm xử lý logic và trả ra kết quả
        const result = await classRoomService.getAllClassRoom({
          accountId: req.data._id,
          type: req.query.type,
        });

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
          "roomName",
          "description",
          "author",
        ]);
        if (!request.numberOfUsers) {
          request.numberOfUsers = 1000;
        }

        // Hàm xử lý logic và trả ra kết quả
        const result = await classRoomService.saveClassRoom(
          req.query.classRoomId,
          {
            accountId: req.data._id,
            ...cloneObjectWithoutFields(request, ["_id"]),
            host: process.env.HOST_BE,
          }
        );

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: "Lưu dữ liệu thành công!" });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
  });

  // API lấy chi tiết phòng học
  onRoute({
    route: ":id",
    role: "USER",
    methods: "get",
    handler: async (req, res) => {
      try {
        // Hàm xử lý logic và trả ra kết quả
        const result = await classRoomService.getByIdClassRoom(req.params.id);

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
        const result = await classRoomService.deleteClassRoom(req.params.id);

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
        const { classRoomId, password } = req.query;

        // Hàm xử lý logic và trả ra kết quả
        const result = await classRoomService.joinClassRoom({
          accountId: req.data._id,
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
        const result = await classRoomService.checkRoomPassword({
          classRoomId,
        });

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: `Kiểm tra thành công!` });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
  });

  // Api set quyền cho thành viên trong phòng
  onRoute({
    route: "set-role",
    role: "USER",
    methods: "put",
    handler: async (req, res) => {
      try {
        // Các hàm xử lý request
        const request = checkNullRequest(req.body, [
          "classRoomId",
          "memberInRoomId",
          "isCensor",
        ]);

        // Hàm xử lý logic và trả ra kết quả
        const result = await classRoomService.setRoleToClassRoom({
          accountId: req.data._id,
          ...request,
        });

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: `Kiểm tra thành công!` });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
  });
};
