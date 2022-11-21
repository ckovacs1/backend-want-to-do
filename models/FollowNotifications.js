const mongoose = require("mongoose");

const FollowNotifScehma = new mongoose.Schema({
    title: {type: String, default: "New Follower Notification"}, 
    description: {
        date: {type: Date, default: Date.now()},
        follower: {type: mongoose.Types.ObjectId, ref: 'User'},
    }
});

const FollowNotifs = mongoose.model('FollowNotifs', FollowNotifScehma);

module.exports = FollowNotifs;