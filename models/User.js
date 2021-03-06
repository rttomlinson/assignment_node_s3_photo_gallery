const mongoose = require("mongoose");
const findOrCreate = require('mongoose-findorcreate');
const Schema = mongoose.Schema;

const UserSchema = mongoose.Schema({
  username: { type: Schema.Types.String },
  photos: [
    {
      type: Schema.Types.ObjectId,
      ref: "Photo"
    }
  ]
});

UserSchema.plugin(findOrCreate);

const User = mongoose.model("User", UserSchema);

module.exports = User;
