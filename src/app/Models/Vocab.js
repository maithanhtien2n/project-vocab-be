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
      title: { type: String, required: true },
      translateTitle: { type: String, required: true },
      isTranslate: { type: Boolean, required: true, default: true },
      isExample: { type: Boolean, required: true, default: true },
      vocabItem: { type: [VocabItem], required: true, default: [] },
    },
    { timestamps: true }
  )
);

module.exports = { Vocab };
