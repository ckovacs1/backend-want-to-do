const mongoose = require('mongoose');

const InvitedNotifSchema = new mongoose.Schema({
  read: { type: Boolean, default: false },
  title: { type: String, default: 'You have been added to a WantToDo!' },
  description: {
    date: { type: Date, default: Date.now() },
    invitedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
  },
  wantToDo: { type: mongoose.Types.ObjectId, ref: 'wantToDo' },
});

const InvitedNotifs = mongoose.model('InvitedNotif', InvitedNotifSchema);

module.exports = InvitedNotifs;
