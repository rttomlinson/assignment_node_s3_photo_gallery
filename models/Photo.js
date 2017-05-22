const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PhotoSchema = mongoose.Schema(
  {
    key: {
      type: Schema.Types.String
    },
    link: {
      type: Schema.Types.String
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

const Photo = mongoose.model("Photo", PhotoSchema);

module.exports = Photo;
