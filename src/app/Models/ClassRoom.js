const mongoose = require("../../Database/ConnectDatabase");
const Schema = mongoose.Schema;

const ClassRoom = mongoose.model(
  "ClassRooms",
  new Schema(
    {
      accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
      },
      image: { type: String, required: false, default: null },
      roomName: { type: String, required: true },
      description: { type: String, required: true },
      author: { type: String, required: true },
      numberOfUsers: { type: Number, required: false, default: 1000 },
      password: { type: String, required: false, default: null },
      memberInRoom: {
        type: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
          },
        ],
        required: false,
        validate: {
          validator: function (v) {
            return v.every((id) => mongoose.Types.ObjectId.isValid(id));
          },
          message: "memberInRoom must contain only valid AccountIds",
        },
        default: [],
      },
    },
    { timestamps: true }
  )
);

module.exports = { ClassRoom };
