const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const multer = require('multer');

const Users = require('./routes/user');
const app = express();

app.use(cors());

// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);
app.use(bodyParser.json());

const db =
  'mongodb+srv://user:pass@wanttodos.wmvco30.mongodb.net/?retryWrites=true&w=majority';
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Mongodb connection Successful'))
  .catch(e => console.log(e));

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(passport.initialize());

require('./config/passport')(passport);

// Routes
app.use('/api/users', Users);

app.get('/profile', (req, res) => {
  res.json({
    profiles: [
      {
        name: 'Charles Leclerc',
        email: 'cleclerc@gmail.com',
        bio: 'Charles Perceval Leclerc is a Monégasque racing driver, currently racing in Formula One for Scuderia Ferrari. He won the GP3 Series championship in 2016 and the FIA Formula 2 Championship in 2017.',
      },
      {
        name: 'Lewis Hamilton',
        email: 'lhamilton@mercedes.com',
        bio: 'In Formula One, Hamilton has won a joint-record seven World Drivers Championship titles, and holds the records for the most wins, pole positions, and podium finishes, among others',
      },
      {
        name: 'Nicolas Latifi',
        email: 'test',
        bio: 'test',
      },
    ],
  });
});

const port = 5000;
app.listen(5000, () => console.log('Server on port 5000'));
