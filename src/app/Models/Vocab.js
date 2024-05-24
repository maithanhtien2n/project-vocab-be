const mongoose = require("../../Database/ConnectDatabase");
const Schema = mongoose.Schema;

const VocabItem = new Schema({
  word: { type: String, required: true },
  translateWord: { type: String, required: true },
  example: { type: String, required: true },
  translateExample: { type: String, required: true },
});

const Vocab = mongoose.model(
  "Vocab",
  new Schema(
    {
      classRoomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ClassRoom",
        required: true,
      },
      title: { type: String, required: true },
      translateTitle: { type: String, required: true },
      isTranslate: { type: Boolean, required: true, default: true },
      isExample: { type: Boolean, required: true, default: true },
      vocabItems: { type: [VocabItem], required: true, default: [] },
    },
    { timestamps: true }
  )
);

module.exports = { Vocab };
