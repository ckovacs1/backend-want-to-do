const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//update userschema after confirming which info should be under user
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  following: [
    {type: mongoose.Types.ObjectId, ref: 'user'}
  ],
  followers: [
    {type: mongoose.Types.ObjectId, ref: 'user'}
  ],
  notifications: [
    {type: mongoose.Types.ObjectId, ref: 'Notification'}
  ],
  wantToDos: [
    {type: mongoose.Types.ObjectId, ref: 'WantToDo'}
  ]

});

const User = mongoose.model("user", UserSchema);

module.exports = User;
