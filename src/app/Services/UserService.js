require("dotenv").config();

const {
  groupBy,
  throwError,
  isValidDate,
  formatToVND,
  cloneObjectWithoutFields,
  convertToStringKeySearch,
} = require("../Utils/index");
const { uploadFile, getById } = require("./CommonService");

const { Account } = require("../Models/Account");
const { User } = require("../Models/User");

module.exports = {
  getAllUser: async ({ tab = "ALL", keySearch = "" }) => {
    try {
      const accountInfo = await User.find().populate({
        path: "accountId",
        model: Account,
        select: "email moneyBalance role status createdAt updatedAt",
      });

      const all = accountInfo
        .map((item) => ({
          ...item?.accountId?._doc,
          ...cloneObjectWithoutFields(item, ["_id", "accountId", "__v"]),
        }))
        .filter(({ role }) => role === "USER");

      const active = all.filter(({ status }) => status === "ACTIVE");
      const locked = all.filter(({ status }) => status === "LOCKED");
      const noAuth = await Account.find({ status: "NO_AUTH" }).select(
        "email otp role status createdAt updatedAt"
      );

      switch (tab) {
        case "ALL":
          return {
            all: all.filter(
              (item) =>
                item?.email?.includes(keySearch) ||
                item?.phoneNumber?.includes(keySearch)
            ),
            active,
            locked,
            noAuth,
          };
        case "ACTIVE":
          return {
            all,
            active: active.filter(
              (item) =>
                item?.email?.includes(keySearch) ||
                item?.phoneNumber?.includes(keySearch)
            ),
            locked,
            noAuth,
          };
        case "LOCKED":
          return {
            all,
            active,
            locked: locked.filter(
              (item) =>
                item?.email?.includes(keySearch) ||
                item?.phoneNumber?.includes(keySearch)
            ),
            noAuth,
          };
        case "NO_AUTH":
          return {
            all,
            active,
            locked,
            noAuth: noAuth.filter(
              (item) =>
                item?.email?.includes(keySearch) ||
                item?.phoneNumber?.includes(keySearch)
            ),
          };
      }
    } catch (error) {
      throw error;
    }
  },

  getOneUser: async (accountId) => {
    try {
      return getById(accountId, Account, "tài khoản", async (value) => {
        const accountInfo = await User.findOne({
          accountId: value?._id,
        }).populate({
          path: "accountId",
          model: Account,
          select:
            "email isUpgrade moneyBalance role status createdAt updatedAt",
        });

        return [accountInfo].map((item) => ({
          account: item?.accountId,
          user: cloneObjectWithoutFields(item, ["accountId", "__v"]),
        }))[0];
      });
    } catch (error) {
      throw error;
    }
  },

  saveUser: async (data) => {
    try {
      const userId = (await User.findOne({ accountId: data.accountId }))._id;

      const fieldImage = "avatar";
      let infoData = { ...data };
      if (!data[fieldImage] || data[fieldImage].base64.includes("http")) {
        infoData.avatar = null;
      }

      const updateUser = await uploadFile(
        User,
        { field: fieldImage, location: "avatar/" },
        userId,
        infoData
      );

      return updateUser;
    } catch (error) {
      throw error;
    }
  },

  updateStatusAccount: async ({ ids, status }) => {
    try {
      if (!["ACTIVE", "LOCKED"].includes(status)) {
        throwError(
          "ERROR_FORMAT_STATUS_CODE",
          "Lỗi mã trạng thái không đúng định dạng!"
        );
      }

      if (!ids.length) {
        return ids.length + " dòng";
      }

      const result = await Account.updateMany(
        { _id: { $in: ids } },
        { $set: { status } }
      );

      return result.matchedCount + " dòng";
    } catch (error) {
      throw error;
    }
  },

  updateMoneyBalanceUser: async ({ ids, moneyNumber, host }) => {
    try {
      if (!ids.length) {
        return ids.length + " dòng";
      }

      if (+moneyNumber > 1000000) {
        throwError(401, "Số tiền mỗi lần nạp phải nhỏ hơn 1.000.000 vnđ");
      }

      for (const id of ids) {
        const account = await Account.findById(id);

        await Account.updateOne(
          { _id: id },
          { $inc: { moneyBalance: +moneyNumber } }
        );

        await TopUpHistory.create({
          accountId: id,
          moneyNumber,
          moneyBalance: +account.moneyBalance + +moneyNumber,
        });

        await Notification.create({
          accountId: id,
          sendType: "PERSONAL",
          image: `${host}/uploads/image/topup-success.png`,
          title: `Tài khoản của bạn vừa được nạp +${formatToVND(moneyNumber)}`,
          content: `<p>Chúng tôi vừa nạp thành công ${formatToVND(
            moneyNumber
          )} vào tài khoản của bạn!</p><p><br></p><p>Nhấp <a href="${
            process.env.HOST_FE
          }/money-wallet" rel="noopener noreferrer" target="_blank">vào đây</a> để kiểm tra tài khoản.</p><p><br></p><p>Xin trân trọng cảm ơn!</p>`,
        });
      }

      return ids.length + " dòng";
    } catch (error) {
      throw error;
    }
  },

  getTopUpHistory: async ({ accountId, keySearch }) => {
    try {
      let query = {};

      const ac = await Account.findById(accountId);

      if (accountId && ac.role !== "ADMIN") {
        query.accountId = accountId;
      }

      let result = (
        await TopUpHistory.find(query).populate({
          path: "accountId",
          model: Account,
          select: "email",
        })
      )
        .map((item) => ({
          ...item?.accountId?._doc,
          ...cloneObjectWithoutFields(item, ["accountId", "__v"]),
        }))
        .reverse();

      if (keySearch) {
        result = result.filter((item) => item.email.includes(keySearch));
      }

      return result;
    } catch (error) {
      throw error;
    }
  },

  delete: async (ids) => {
    try {
      for (const id of ids) {
        getById(id, Account, "tài khoản", async (value) => {
          await Account.deleteOne(value);
        });
      }

      return ids.length + " dòng";
    } catch (error) {
      throw error;
    }
  },

  changeModel: async ({ accountId, isUpgrade }) => {
    try {
      const result = await Account.updateOne({ _id: accountId }, { isUpgrade });
      return result;
    } catch (error) {
      throw error;
    }
  },

  getMessengerList: async ({ keySearch }) => {
    try {
      const messengers = (
        await Messenger.find()
          .populate({
            path: "accountId",
            model: Account,
            select: "email",
          })
          .populate({
            path: "userId",
            model: User,
            select: "avatar fullName",
          })
      )
        .map((item) => ({
          _id: item?._id,
          accountId: item?.accountId?._id,
          avatar: item?.userId?.avatar,
          fullName: item?.userId?.fullName,
          content: item?.content,
          sender: item?.sender,
          sendDate: item?.sendDate,
          isRead: item?.isRead,
        }))
        .filter(
          (item) =>
            convertToStringKeySearch(item?.email).includes(
              convertToStringKeySearch(keySearch)
            ) ||
            convertToStringKeySearch(item?.fullName).includes(
              convertToStringKeySearch(keySearch)
            )
        );

      let messengersGroupBy = await groupBy(messengers, "accountId");
      for (const key in messengersGroupBy) {
        const msgInfo =
          messengersGroupBy[key].map((item) => ({
            accountId: item?.accountId,
            avatar: item?.avatar,
            fullName: item?.fullName,
            content: item?.content,
          })) || [];
        messengersGroupBy[key] = {
          ...msgInfo[msgInfo?.length - 1],
          unreadMessages: +messengersGroupBy[key]
            .map((item) => ({ sender: item?.sender, isRead: item?.isRead }))
            .filter(({ isRead, sender }) => sender === "USER" && !isRead)
            .length,
        };
      }

      return Object.values(messengersGroupBy);
    } catch (error) {
      throw error;
    }
  },

  getMessengerDetail: async ({ accountId, accountRole }) => {
    try {
      const messengers = (
        await Messenger.find({ accountId }).populate({
          path: "userId",
          model: User,
          select: "avatar fullName dateOfBirth",
        })
      ).map((item) => ({
        _id: item?._id,
        accountId: item?.accountId,
        userId: item?.userId?._id,
        avatar:
          item?.sender === "ADMIN"
            ? `${process.env.HOST_BE}/uploads/image/image-admin.png`
            : item?.userId?.avatar,
        fullName:
          item?.sender === "ADMIN" ? "Quản trị viên" : item?.userId?.fullName,
        dateOfBirth:
          item?.sender === "ADMIN" ? "06/12/2000" : item?.userId?.dateOfBirth,
        sender: item?.sender,
        content: item?.content,
        sendDate: item?.sendDate,
        isRead: item?.isRead,
        createdAt: item?.createdAt,
        updatedAt: item?.updatedAt,
      }));

      const onReturnPartnerInfo = () => {
        switch (accountRole) {
          case "USER":
            return {
              sender: "ADMIN",
              partnerInfo: {
                avatar: `${process.env.HOST_BE}/uploads/image/image-admin.png`,
                fullName: "Quản trị viên",
                yearOld: `${+new Date().getFullYear() - 2000} tuổi`,
              },
            };
          case "ADMIN":
            return {
              sender: "USER",
              partnerInfo: {
                avatar: messengers.length ? messengers[0]?.avatar : "",
                fullName: messengers.length ? messengers[0]?.fullName : "",
                yearOld: messengers.length
                  ? `${
                      messengers[0]?.dateOfBirth
                        ? new Date().getFullYear() -
                          +messengers[0]?.dateOfBirth?.split("/")[2]
                        : "Chưa biết"
                    } tuổi`
                  : "",
              },
            };
          default:
            return {
              sender: "",
              partnerInfo: {
                avatar: "",
                fullName: "",
              },
            };
        }
      };

      const result = {
        partnerInfo: onReturnPartnerInfo().partnerInfo,
        result: messengers,
        unreadMessages: +messengers.filter(
          ({ isRead, sender }) =>
            sender === onReturnPartnerInfo().sender && !isRead
        ).length,
      };

      return result;
    } catch (error) {
      throw error;
    }
  },

  sendMessenger: async ({ accountId, sender, content, sendDate }) => {
    try {
      if (!["USER", "ADMIN"].includes(sender)) {
        throwError("SENDER_INVALID", "Lỗi trường sender không hợp lệ!");
      }

      if (!isValidDate(sendDate)) {
        throwError("SEND_DATE_INVALID", "Lỗi trường sendDate không hợp lệ!");
      }

      const user = await User.findOne({ accountId });

      const result = await Messenger.create({
        accountId,
        userId: user?._id,
        sender,
        content,
        sendDate,
      });

      return result;
    } catch (error) {
      throw error;
    }
  },

  sendMessenger: async ({ accountId, sender }) => {
    try {
      if (!["USER", "ADMIN"].includes(sender)) {
        throwError("SENDER_INVALID", "Lỗi trường sender không hợp lệ!");
      }

      const onReturnRole = () => {
        switch (sender) {
          case "USER":
            return "ADMIN";
          case "ADMIN":
            return "USER";
          default:
            return "";
        }
      };

      const messengerIds = (
        await Messenger.find({
          accountId,
          sender: onReturnRole(),
          isRead: false,
        })
      ).map(({ _id }) => _id);

      const result = await Messenger.updateMany(
        { _id: { $in: messengerIds } },
        { $set: { isRead: true } }
      );

      return result;
    } catch (error) {
      throw error;
    }
  },
};
