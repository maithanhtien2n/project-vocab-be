require("dotenv").config();

const { cloneObjectWithoutFields, throwError } = require("../Utils/index");
const { uploadFile, getById } = require("./CommonService");

const { Vocab } = require("../Models/Vocab");
const { ClassRoom } = require("../Models/ClassRoom");

module.exports = {
  getAllVocab: async ({ accountId, classRoomId }) => {
    try {
      const isWasInTheRoom = await ClassRoom.findOne({
        _id: classRoomId,
        memberInRoom: { $elemMatch: { accountId } },
      });
      if (!isWasInTheRoom) {
        throwError("NOT_HAVE_ACCESS", "Bạn chưa có mặt ở phòng này!");
      }

      const vocabulary = await Vocab.find({ classRoomId });

      return vocabulary;
    } catch (error) {
      throw error;
    }
  },

  getByIdVocab: async (id) => {
    try {
      return getById(id, Vocab, "vocab", async (value) => {
        return value;
      });
    } catch (error) {
      throw error;
    }
  },

  createVocab: async (request) => {
    try {
      const isWasInTheRoom = await ClassRoom.findOne({
        _id: request.classRoomId,
        memberInRoom: { $elemMatch: { accountId: request.accountId } },
      });
      if (!isWasInTheRoom) {
        throwError("NOT_HAVE_ACCESS", "Bạn chưa có mặt ở phòng này!");
      }

      const memberInRoomInfo = isWasInTheRoom.memberInRoom.find(
        (item) => `${item.accountId}` === request.accountId
      );

      if (!["ROOM_MASTER", "CENSOR"].includes(memberInRoomInfo.role)) {
        throwError(
          "NO_RIGHT_TO_PROCESS",
          "Bạn không có quyền thực hiện chức năng này!"
        );
      }

      const result = await Vocab.create({ ...request });

      return result;
    } catch (error) {
      throw error;
    }
  },

  updateVocab: async (id, request) => {
    try {
      const isWasInTheRoom = await ClassRoom.findOne({
        _id: request.classRoomId,
        memberInRoom: { $elemMatch: { accountId: request.accountId } },
      });
      if (!isWasInTheRoom) {
        throwError("NOT_HAVE_ACCESS", "Bạn chưa có mặt ở phòng này!");
      }

      const memberInRoomInfo = isWasInTheRoom.memberInRoom.find(
        (item) => `${item.accountId}` === request.accountId
      );

      if (!["ROOM_MASTER", "CENSOR"].includes(memberInRoomInfo.role)) {
        throwError(
          "NO_RIGHT_TO_PROCESS",
          "Bạn không có quyền thực hiện chức năng này!"
        );
      }

      const result = await Vocab.updateOne(
        { _id: id },
        { ...cloneObjectWithoutFields(request, ["_id"]) }
      );

      return result;
    } catch (error) {
      throw error;
    }
  },

  deleteVocab: async ({ ids }) => {
    try {
      const result = await Vocab.deleteMany({ _id: { $in: ids } });
      return result.deletedCount + " dòng";
    } catch (error) {
      throw error;
    }
  },
};
