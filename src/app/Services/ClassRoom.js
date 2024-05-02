require("dotenv").config();

const { cloneObjectWithoutFields, throwError } = require("../Utils/index");
const { uploadFile, getById } = require("./CommonService");

const { ClassRoom } = require("../Models/ClassRoom");

module.exports = {
  getAllClassRoom: async ({ accountId, type }) => {
    try {
      let result = [];

      if (type === "myClassRoom") {
        result = await ClassRoom.find({ accountId });
      }

      if (type === "joinedClassroom") {
        result = await ClassRoom.find({
          memberInRoom: { $in: [accountId] },
        });
      }

      return result;
    } catch (error) {
      throw error;
    }
  },

  getByIdClassRoom: async (id) => {
    try {
      const result = await ClassRoom.findById(id);
      return result;
    } catch (error) {
      throw error;
    }
  },

  saveClassRoom: async (classRoomId, data) => {
    try {
      const fieldImage = "image";
      let infoData = { ...data };
      if (
        !data[fieldImage] ||
        !data[fieldImage]?.base64 ||
        data[fieldImage]?.base64?.includes("http")
      ) {
        infoData.image = null;
      }

      const result = await uploadFile(
        ClassRoom,
        { field: fieldImage, location: "images/" },
        classRoomId,
        infoData
      );

      return result;
    } catch (error) {
      throw error;
    }
  },

  deleteClassRoom: async (id) => {
    try {
      return getById(id, ClassRoom, "phòng", async (value) => {
        const result = await ClassRoom.deleteOne(value);
        return result;
      });
    } catch (error) {
      throw error;
    }
  },

  joinClassRoom: async ({ accountId, classRoomId, password }) => {
    try {
      return getById(classRoomId, ClassRoom, "phòng", async (value) => {
        const classRoom = await ClassRoom.findOne({
          _id: value?._id,
          memberInRoom: { $in: [accountId] },
        });

        if (!classRoom && value.password && value.password !== password) {
          throwError(
            "INCORRECT_PASSWORD",
            "Mật khẩu vào phòng không chính xác!"
          );
        }

        const isWasInTheRoom = await ClassRoom.findOne({
          memberInRoom: { $in: [accountId] },
        });
        if (isWasInTheRoom) {
          throwError("IS_WAS_IN_THE_ROOM", "Bạn đã có mặt ở phòng này!");
        }

        if (+value.numberOfUsers >= +value.memberInRoom.length) {
          throwError("ROOM_IS_FULL", "Phòng đã đạt số lượng cho phép!");
        }

        const result = await ClassRoom.updateOne(
          {
            _id: value?._id,
            memberInRoom: { $not: { $elemMatch: { $eq: accountId } } },
          },
          { $addToSet: { memberInRoom: accountId } }
        );
        return result;
      });
    } catch (error) {
      throw error;
    }
  },

  checkRoomPassword: async ({ classRoomId }) => {
    try {
      const result = await ClassRoom.findById(classRoomId);
      return { isPassword: result?.password ? true : false };
    } catch (error) {
      throw error;
    }
  },
};
