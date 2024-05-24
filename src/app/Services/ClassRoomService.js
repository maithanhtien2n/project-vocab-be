require("dotenv").config();

const { cloneObjectWithoutFields, throwError } = require("../Utils/index");
const { uploadFile, getById } = require("./CommonService");

const { ClassRoom } = require("../Models/ClassRoom");

module.exports = {
  getAllClassRoom: async ({ accountId, type }) => {
    try {
      let result = [];

      if (type === "myClassRoom") {
        try {
          const myClassRoom = await ClassRoom.find({ accountId });
          result = myClassRoom;
        } catch (error) {
          result = [];
        }
      }

      if (type === "joinedClassroom") {
        try {
          const joinedClassroom = await ClassRoom.find({
            accountId: { $ne: accountId },
            memberInRoom: { $elemMatch: { accountId } },
          });

          result = joinedClassroom;
        } catch (error) {
          result = [];
        }
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

      if (classRoomId === "null") {
        infoData.memberInRoom = [
          { accountId: data.accountId, role: "ROOM_MASTER" },
        ];
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
          memberInRoom: { $in: [new Object(accountId)] },
        });

        if (!classRoom && value.password && value.password !== password) {
          throwError(
            "INCORRECT_PASSWORD",
            "Mật khẩu vào phòng không chính xác!"
          );
        }

        const isWasInTheRoom = await ClassRoom.findOne({
          _id: classRoomId,
          memberInRoom: { $elemMatch: { accountId } },
        });

        if (isWasInTheRoom) {
          throwError("IS_WAS_IN_THE_ROOM", "Bạn đã có mặt ở phòng này!");
        }

        if (+value.numberOfUsers === +value.memberInRoom.length) {
          throwError("ROOM_IS_FULL", "Phòng đã đạt số lượng cho phép!");
        }

        const result = await ClassRoom.updateOne(
          {
            _id: classRoomId,
            memberInRoom: { $not: { $elemMatch: { accountId: accountId } } },
          },
          { $addToSet: { memberInRoom: { accountId: accountId } } }
        );
        return result;
      });
    } catch (error) {
      throw error;
    }
  },

  checkRoomPassword: async ({ classRoomId }) => {
    try {
      return getById(classRoomId, ClassRoom, "phòng", async (value) => {
        return { isPassword: value?.password ? true : false };
      });
    } catch (error) {
      throw error;
    }
  },

  setRoleToClassRoom: async ({
    accountId,
    classRoomId,
    memberInRoomId,
    isCensor,
  }) => {
    try {
      return getById(classRoomId, ClassRoom, "phòng", async (value) => {
        console.log(accountId, `${value.accountId}`);
        if (`${value.accountId}` !== accountId) {
          throwError(
            "ROLE_INVALID",
            "Bạn không phải là chủ phòng, bạn không thể thực hiện chức năng này!"
          );
        }

        if (memberInRoomId === accountId) {
          throwError(
            "MEMBER_IN_ROM_INVALID",
            "Bạn không thể tự set quyền cho mình!"
          );
        }

        const resultUpdate = await ClassRoom.updateOne(
          { _id: classRoomId, "memberInRoom.accountId": memberInRoomId },
          { $set: { "memberInRoom.$.role": isCensor ? "CENSOR" : "MEMBER" } }
        );
        return resultUpdate;
      });
    } catch (error) {
      throw error;
    }
  },
};
