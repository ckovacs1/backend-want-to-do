// schema for W2Ds 
import mongoose from 'mongoose';
import dayjs, { Dayjs } from 'dayjs';

// types all based on frontend data types 
const WantToDoSchema = new mongoose.Schema({
    // _id by default
    title: {type: String, default: "Untitled Want-To-Do"},
    description: String, // assume it's not required 
    startDateTime: {type: Dayjs, required: true},
    endDateTime: {type: Dayjs, required: true}, // will making sure this date is later than startDate be handled before creating new doc? 
    repetition: {type: String, required: true}, // looks like repition value is a string
    repeatOn: [String],
    category: {type: String, required: true},
    inviteFriends: [{type: mongoose.Types.ObjectId, ref: 'User'}]
});

const User = mongoose.model('WantToDo', WantToDoSchema);