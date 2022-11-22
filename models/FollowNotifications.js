const mongoose = require("mongoose");

const FollowNotifScehma = new mongoose.Schema({
    read: {type: Boolean, default: false},
    title: {type: String, default: "You have a new follower"}, 
    description: {
        date: {type: Date, default: Date.now()},
        follower: {type: mongoose.Types.ObjectId, ref: 'User'},
    }
});

const FollowNotifications = mongoose.model('FollowNotifs', FollowNotifScehma);

module.exports = FollowNotifications;