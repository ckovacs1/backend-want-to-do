const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const multer = require('multer');

const Users = require('./routes/user');
const toDos = require('./routes/todos');
const app = express();
const User = require('./models/User');

const toDo = require('./models/WantToDos');
const Notif = require('./models/FollowNotifications');

app.use(cors());

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // allow requests with no origin
//       // (like mobile apps or curl requests)
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) === -1) {
//         var msg =
//           'The CORS policy for this site does not allow access from the specified Origin.';
//         return callback(new Error(msg), false);
//       }
//       return callback(null, true);
//     },
//   }),
// );

// Bodyparser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = require('./db');

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

require('./config/passport')(passport);
/* // passport setup
app.use(passport.initialize());
app.use(passport.session());

// make user data available to all templates
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
}); */

// Routes
app.use('/api/users', Users);
app.use('/api/todos', toDos);



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

app.get(
  '/api/loggedInUserInfo',
  passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    if (!req.user) {
      return res.status(404).json({ success: false, error: `User not found` });
    }

    const userInfo = await User.findOne({ _id: req.user.id });
    if (!userInfo) {
      return res.status(404).json({ success: false, error: `User not found` });
    }

    return res.status(200).json({ success: true, data: userInfo });
  },
);

app.get('/api/viewUsers', async function (req, res) {
  await User.find({}, (err, allUsers) => {
    if (err) {
      return res.status(400).json({ success: false, error: err });
    }
    if (!allUsers.length) {
      return res.status(404).json({ success: false, error: `User not found` });
    }
    return res.status(200).json({ success: true, data: allUsers });
  }).catch(err => console.log(err));
});

app.get('/api/viewNotifs', async function (req, res) {
  await Notif.find({}, (err, allNotifs) => {
    if (err) {
      return res.status(400).json({ success: false, error: err });
    }
    if (!allNotifs.length) {
      return res
        .status(404)
        .json({ success: false, error: `Notification not found` });
    }
    return res.status(200).json({ success: true, data: allNotifs });
  }).catch(err => console.log(err));
});

app.post(
  '/api/newFollowerNotif/:id',
  passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    // logged in user user is the one that folows
    // other user is the one that recieves the notif
    const getsNotif = await User.findOne({ _id: req.params.id });
    const newFollower = await User.findOne({ _id: req.user.id });

    if (!getsNotif) {
      return res
        .status(400)
        .json({ success: false, error: "User id doesn't exist" });
    }

    const newNotif = new Notif({
      read: false,
      title: 'You have a new follower',
      description: {
        date: Date.now(),
        follower: newFollower,
      },
    });

    newNotif.save(function (err, saved) {
      if (err) {
        return res.status(400).json({
          success: false,
          error: 'There was an error saving the notification',
        });
      }
      User.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { notifications: saved } },
        function (err, user) {
          if (err) return err;
          return res.status(200).json({
            success: true,
            data: { initiatedFollow: newFollower, recievedNewFollower: user },
          });
        },
      );
    });
  },
);

app.post('/api/setNotifAsRead/:id', async function (req, res) {
  // find a notification by notification id
  // assigns its value as read
  if (!req.params.id) {
    return res.status(400).json({ success: false, error: 'No id in param' });
  }
  const getNotif = Notif.findOneAndUpdate(
    { _id: req.params.id },
    { $set: { read: true } },
  );

  if (!getNotif) {
    return res
      .status(400)
      .json({ success: false, error: 'Notif does not exist' });
  }
  return res.status(400).json({ success: true });
});

app.get(
  '/api/viewFollowers',
  passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    if (!req.user.followers) {
      return res.status(400).json({ success: false, error: 'err' });
    } else if (req.user.followers.length === 0) {
      return res.status(200).json({ success: false, followers: [] });
    }

    User.findOne({ _id: req.user.id }).exec(function (err, user) {
      if (err) return res.status(400).json({ success: false, error: err });
      return res.status(400).json({ success: true, followers: user.followers });
    });
  },
);

app.get(
  '/api/viewFollowing',
  passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    if (!req.user.following) {
      return res.status(400).json({ success: false, error: 'err' });
    } else if (req.user.following.length === 0) {
      return res.status(200).json({ success: false, following: [] });
    }

    User.findOne({ _id: req.user.id }).exec(function (err, user) {
      if (err) return res.status(400).json({ success: false, error: err });
      return res.status(200).json({ success: true, following: user.following });
    });
  },
);

app.post(
  '/api/unfollow/:id',
  passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    // logged in user chooses to unfollow user :id
    if (!req.params.id) {
      return res
        .status(400)
        .json({ success: false, error: 'No user id provided' });
    }

    // retrieve, edit, and set the unfollowed user's follower list
    User.findOne({ _id: req.params.id }, async function (err, found) {
      if (err) return res.status(400).json({ success: false, error: err });
      if (!found) {
        return res
          .status(400)
          .json({ success: false, error: 'User not found' });
      }
      const removeFollowerIdx = found.followers.indexOf(req.user.id);

      if (removeFollowerIdx === -1) {
        return res
          .status(400)
          .json({ success: false, error: 'Invalid follower' });
      }
      const newFollowerList = found.followers.splice(removeFollowerIdx, 1);
      await User.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { followers: newFollowerList } },
      );
    });
    // retrieve, edit, and set the user who unfollowed's follower list
    User.findOne({ _id: req.user.id }, async function (err, found) {
      if (err) return res.status(400).json({ success: false, error: err });
      if (!found) {
        return res
          .status(400)
          .json({ success: false, error: 'User not found' });
      }
      const removeFollowingIdx = found.following.indexOf(req.params.id);

      if (removeFollowingIdx === -1) {
        return res
          .status(400)
          .json({ success: false, error: 'Invalid follower' });
      }
      const newFollowingList = found.following.splice(removeFollowingIdx, 1);
      await User.findOneAndUpdate(
        { _id: req.user.id },
        { $set: { following: newFollowingList } },
      );
    });
    return res.status(200).json({ success: true });
  },
);

app.post(
  '/api/follow/:id',
  passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    if (!req.params.id) {
      return res
        .status(400)
        .json({ success: false, error: 'No user id provided' });
    }

    const toFollowID = req.params.id;
    const loggedInUser = await User.findOne({ _id: req.user.id });
    const toFollowUser = await User.findOneAndUpdate(
      { _id: toFollowID },
      { $push: { followers: loggedInUser } },
    );

    if (!toFollowUser) {
      return res.status(400).json({ success: false, error: 'err' });
    }

    const updateUser = await User.findOneAndUpdate(
      { _id: req.user._id }, // return data here?
      { $push: { following: toFollowUser } },
    );

    return res.status(200).json({ success: true });
  },
);

app.get(
  '/api/viewOtherProfile/:id',
  passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    if (!req.params.id) {
      return res
        .status(400)
        .json({ success: false, error: 'No user id provided' });
    }

    if (req.params.id === req.user.id) {
      // to do
    }

    User.findOne({ _id: req.params.id }, async function (err, found) {
      if (err) return res.status(400).json({ success: false, error: err });
      if (!found)
        return res.status(400).json({ success: false, error: 'No user found' });

      const loggedIn = await User.findOne({ _id: req.user.id });
      if (loggedIn.following.indexOf(found._id) === -1) {
        return res.status(200).json({
          success: true,

          data: {
            name: found.name,
            following: found.following,
            followers: found.followers,
          },
        }); // send less informatuion than if the user were following
      }
      return res.status(200).json({
        success: true,
        data: {
          desc: 'you follow this user!',
          name: found.name,
          following: found.following,
          followers: found.followers,
          wantToDos: found.wantToDos,
        },
      });
    });
  },
);

//get user id
app.get(
  '/api/test/token',
  //use this authenticate middleware to get user id and info
  passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    console.log(req.user);
    return res.status(200).json({ success: true });
  },
);

const port = 5000;
app.listen(5000, () => console.log('Server on port 5000'));
