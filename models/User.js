const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//update userschema after confirming which info should be under user
const UserSchema = new Schema({
  name: {
    first: {
      type: String,
      required: true,
    },
    last: {
      type: String,
      required: true,
    },
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
  following: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  notifications: [{ type: mongoose.Types.ObjectId, ref: 'Notification' }],
  inviteNotifs: [{ type: mongoose.Types.ObjectId, ref: 'InviteNotification' }],
  toDos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'toDos' }],
});

const User = mongoose.model('user', UserSchema);

module.exports = User;
