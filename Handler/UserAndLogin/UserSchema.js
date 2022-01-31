const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true
  },
  login: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;