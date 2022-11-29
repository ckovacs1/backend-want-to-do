const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const multer = require('multer');
const session = require("express-session");
const LocalStrategy = require('passport-local').Strategy;

const Users = require('./routes/user');
const app = express();
const User = require('./models/User');

const toDos = require('./models/WantToDos');
const Notif = require("./models/FollowNotifications"); 

app.use(cors());

app.use(
	cors({
    origin: function (origin, callback) {
			// allow requests with no origin
			// (like mobile apps or curl requests)
			if (!origin) return callback(null, true);
			if (allowedOrigins.indexOf(origin) === -1) {
				var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
				return callback(new Error(msg), false);
			}
			return callback(null, true);
		},
	})
);

app.use(session({
  secret: 'WANT',
  resave: false,
  saveUninitialized: true,
}));

// Bodyparser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = require('./db');

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use( (req, res ,next) => {
  console.log(req.method, req.path, req.body, req.user)
  next();
});


require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user.id)
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
      done(err, user)
  });
});
app.post('api/users/login', passport.authenticate('jwt', {
  successRedirect: '/notification',
  failureRedirect: '/login'}));


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


app.post('/api/createtoDos', function(req, res){
  const body = req.body

  if (!body) {
      return res.status(400).json({
          success: false,
          error: 'You must provide a todo',
      })
  }

  const toDo = new toDos(req.body)

  if (!toDo) {
      return res.status(400).json({ success: false, error: err })
  }

  toDo
      .save()
      .then(() => {
          return res.status(201).json({
              success: true,
              id: toDo._id,
              message: 'todo created!',
          })
      })
      .catch(error => {
          return res.status(400).json({
              error,
              message: 'todo not created!',
          })
      })
});

app.get('/api/viewtoDos', async function(req, res){
  await toDos.find({}, (err, alltoDos) => {
    if (err) {
        return res.status(400).json({ success: false, error: err })
    }
    if (!alltoDos.length) {
        return res
            .status(404)
            .json({ success: false, error: `toDo not found` })
    }
    return res.status(200).json({ success: true, data: alltoDos })
}).catch(err => console.log(err))
});

app.delete('/api/deletetoDos', async function(req, res){
  await toDos.findOneAndDelete({ _id: req.params.id }, (err, toDo) => {
    if (err) {
        return res.status(400).json({ success: false, error: err })
    }

    if (!toDo) {
        return res
            .status(404)
            .json({ success: false, error: `toDo not found` })
    }

    return res.status(200).json({ success: true, data: toDo })
}).catch(err => console.log(err))
});


app.get('/api/viewtoDoById', async function(req, res){
  await toDos.findOne({ _id: req.params.id }, (err, toDo) => {
    if (err) {
        return res.status(400).json({ success: false, error: err })
    }

    if (!toDo) {
        return res
            .status(404)
            .json({ success: false, error: `toDo not found` })
    }
    return res.status(200).json({ success: true, data: toDo })
}).catch(err => console.log(err))
});


//maybe add one where you update to show that you did it?


app.get('/api/viewUsers', async function(req, res){
  await User.find({}, (err, allUsers) => {
    if (err) {
        return res.status(400).json({ success: false, error: err })
    }
    if (!allUsers.length) {
        return res
            .status(404)
            .json({ success: false, error: `User not found` })
    }
    return res.status(200).json({ success: true, data: allUsers })
}).catch(err => console.log(err))
});

app.get('/api/viewNotifs', async function(req,res) {
  await Notif.find({}, (err, allNotifs) => {
    if (err) {
        return res.status(400).json({ success: false, error: err })
    }
    if (!allNotifs.length) {
        return res
            .status(404)
            .json({ success: false, error: `Notification not found` })
    }
    return res.status(200).json({ success: true, data: allNotifs})
}).catch(err => console.log(err))
});

app.post('/api/updateNotifs', async function(req,res) {
  const loggedInUserID = '';
});

app.get('/api/viewFollowers', async function(req,res) {
   // friend1 is the currently logged in user
   friend1 = await User.findOne({name: "Tester McTest"});
   // friend2 is another user with an account 
   friend2 = await User.findOne({name: "Friend McTest"});  

  const loggedInFollowers = friend1.followers;
  res.status(200).json({success: true, followers: loggedInFollowers})
});

app.get('/api/viewFollowing', async function(req,res) {
   // friend1 is the currently logged in user
   friend1 = await User.findOne({name: "Tester McTest"});
   // friend2 is another user with an account 
   friend2 = await User.findOne({name: "Friend McTest"});  

  const loggedInFollowing = friend1.following;
  res.status(200).json({success: true, following: loggedInFollowing})
});

app.post('/api/unfollow', async function(req,res) {
  // some variable tht finds the user tht the logged in user wants to unfollow
  // suppose it's friend2
   // friend1 is the currently logged in user
   friend1 = await User.findOne({name: "Tester McTest"});
   // friend2 is another user with an account 
   friend2 = await User.findOne({name: "Friend McTest"});  

  const loggedInFollow = friend1.following;
  const toDelete = loggedInFollow.indexOf(friend2);
  loggedInFollow.splice(index, 1);

});

app.get('/api/follow', async function(req,res) {
  // friend1 is the currently logged in user
  friend1 = await User.findOne({name: "Tester McTest"});
  // friend2 is another user with an account 
  friend2 = await User.findOne({name: "Friend McTest"});  

  // following someone new
  await User.updateOne({_id: friend1._id}, {$push: {"following": friend2}});
  await friend1.save();

  // when you follow someone, the person you recieve gets a new follower 
  const newList2 = friend2.followers.unshift(friend1);
  User.updateOne({_id: friend2._id}, {$push: {"followers": friend1}});
  await friend2.save();

  await User.find({}).populate("followers");
  await User.find({}).populate("following");
  
  return res.status(200).json({success: true, loggedInUser: friend1.following, followedUser: friend2.followers});

  // no error handling -> needs to be added

});

const port = 5000;
app.listen(5000, () => console.log('Server on port 5000'));
