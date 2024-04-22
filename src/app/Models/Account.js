const mongoose = require("../../Database/ConnectDatabase");
const Schema = mongoose.Schema;

const Account = mongoose.model(
  "Accounts",
  new Schema(
    {
      avatar: { type: String, required: false, default: null },
      fullName: { type: String, required: true },
      phoneNumber: { type: Number, required: false, default: null },
      gender: { type: Boolean, required: false, default: null },
      dayOfBirth: { type: String, required: true },
      address: { type: String, required: false, default: null },
      email: { type: String, required: true },
      password: { type: String, required: true },
      role: { type: String, required: false, default: "USER" },
    },
    { timestamps: true }
  )
);

module.exports = { Account };
