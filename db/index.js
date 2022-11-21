const mongoose = require('mongoose');

mongoose
  .connect(
    'mongodb+srv://user:pass@wanttodos.wmvco30.mongodb.net/?retryWrites=true&w=majority',
    { useNewUrlParser: true },
  )
  .catch(e => {
    console.error('Connection error', e.message);
  });

const db = mongoose.connection;

module.exports = db;
