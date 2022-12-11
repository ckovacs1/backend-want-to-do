// schema for W2Ds
const mongoose = require('mongoose');
//const dayjs, { Dayjs } from 'dayjs';

// types all based on frontend data types
const WantToDoSchema = new mongoose.Schema({
  // _id by default
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, default: 'Untitled Want-To-Do' },
  description: String, // assume it's not required
  startDateTime: { type: Date, default: Date.now },
  repetition: { type: Number, default: false }, // how many times repeat, 0 is not repeat
  repeatType: { type: Number }, //daily = 1, weekly = 2, monthly = 3
  repeatIdx: { type: Number, default: null },
  parentId: { type: mongoose.Schema.Types.ObjectId, default: null },
  category: { type: String, required: true },
  complete: { type: Boolean, default: false },
  repeat: [
    {
      complete: { type: Boolean, default: false },
    },
  ],
});

const toDos = mongoose.model('WantToDo', WantToDoSchema);

module.exports = toDos;
