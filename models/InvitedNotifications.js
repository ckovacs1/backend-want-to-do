const mongoose = require('mongoose');

const InvitedNotifSchema = new mongoose.Schema({
  read: { type: Boolean, default: false },
  title: { type: String, default: 'You have been invited to a WantToDo!' },
  description: {
    date: { type: Date, default: Date.now() },
    invitedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
    wantToDo: { type: mongoose.Types.ObjectId, ref: 'WantToDo' },
  },
});

const InvitedNotifs = mongoose.model('InvitedNotif', InvitedNotifSchema);

module.exports = InvitedNotifs;
