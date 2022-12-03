// schema for W2Ds 
const mongoose = require("mongoose");
//const dayjs, { Dayjs } from 'dayjs';

// types all based on frontend data types 
const WantToDoSchema = new mongoose.Schema({
    // _id by default
    title: {type: String, default: "Untitled Want-To-Do"},
    description: String, // assume it's not required 
    startDateTime: {type: Date, default: Date.now},
    endDateTime: {type: Date, default: Date.now}, // will making sure this date is later than startDate be handled before creating new doc? 
    repetition: {type: Boolean}, // looks like repition value is a string
    repeatOn: [String],
    category: {type: String, required: true},
    complete: {type: Boolean, default: false}
    //inviteFriends: [{type: mongoose.Types.ObjectId, ref: 'User'}]
});

const toDos = mongoose.model('WantToDo', WantToDoSchema);

module.exports = toDos;