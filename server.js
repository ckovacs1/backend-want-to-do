const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const Users = require('./routes/user');
const toDos = require('./routes/todos');
const app = express();
const User = require('./models/User');

const toDo = require('./models/WantToDos');
const Notif = require('./models/FollowNotifications');
const invitedNotif = require('./models/InvitedNotifications');

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
const InvitedNotifs = require('./models/InvitedNotifications');

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

// make user data available to all templates
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Routes
app.use('/api/users', Users);
app.use('/api/todos', toDos);

app.get('/profile', (req, res) => {
  res.json({
    profiles: [],
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

app.get(
  '/api/viewNotifs',
  passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    await Notif.find({ _id: { $in: req.user.notifications } })
      .exec((err, allNotifs) => {
        if (err) {
          return res.status(400).json({ success: false, error: err });
        }
        if (!allNotifs.length) {
          return res
            .status(404)
            .json({ success: false, error: `Notification not found` });
        }
        return res.status(200).json({ success: true, data: allNotifs });
      })
      .catch(err => console.log(err));
  },
);

app.get(
  '/api/viewInviteNotifs',
  passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    await invitedNotif
      .find({ _id: { $in: req.user.inviteNotifs } })
      .exec((err, allNotifs) => {
        if (err) {
          return res.status(400).json({ success: false, error: err });
        }
        if (!allNotifs.length) {
          return res
            .status(404)
            .json({ success: false, error: `Notification not found` });
        }
        return res.status(200).json({ success: true, data: allNotifs });
      })
      .catch(err => console.log(err));
  },
);

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

app.get(
  '/api/viewFollowers',
  passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    if (!req.user.followers) {
      return res.status(400).json({ success: false, error: 'err' });
    } else if (req.user.followers.length === 0) {
      return res.status(200).json({ success: true, followers: [] });
    }

    User.find({ _id: { $in: req.user.followers } }).exec(function (
      err,
      followers,
    ) {
      if (err) return res.status(400).json({ success: false, error: err });
      return res.status(200).json({ success: true, followers });
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

    User.find({ _id: { $in: req.user.following } }).exec(function (
      err,
      following,
    ) {
      if (err) return res.status(400).json({ success: false, error: err });
      return res.status(200).json({ success: true, following });
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
    const involvedUsers = [];
    if (!req.params.id) {
      return res
        .status(400)
        .json({ success: false, error: 'No user id provided' });
    }

    User.findOne({ _id: req.user.id }, function (err, found) {
      if (err) {
        return res.status(400).json({ success: false, error: err });
      }

      const isGoingToFollow = found.following.concat(req.params.id);
      involvedUsers.push(found);
      User.findOneAndUpdate(
        { _id: req.user.id },
        { $set: { following: isGoingToFollow } },
      );
    });
    User.findOne({ _id: req.params.id }, function (err, found) {
      if (err) {
        return res.status(400).json({ success: false, error: err });
      }
      const getsNewFollower = found.followers.concat(req.user.id);
      involvedUsers.push(found);
      User.findByIdAndUpdate(
        { _id: req.params.id },
        { $set: { followers: getsNewFollower } },
      );
    });
    return res
      .status(200)
      .json({
        success: true,
        followedSomeone: involvedUsers[0],
        gotNewFolloer: involvedUsers[1],
      });
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

    User.findOne({ _id: req.params.id }, async function (err, otherUser) {
      if (err) return res.status(400).json({ success: false, error: err });
      if (!otherUser)
        return res.status(400).json({ success: false, error: 'No user found' });

      const loggedIn = await User.findOne({ _id: req.user.id });
      if (loggedIn.following.indexOf(otherUser._id) === -1) {
        return res.status(200).json({
          success: true,

          data: {
            isFollowing: false,
            otherUser: otherUser,
          },
        }); // send less informatuion than if the user were following
      }
      return res.status(200).json({
        success: true,
        data: {
          isFollowing: true,
          other: found,
        },
      });
    });
  },
);

app.post(
  '/api/changeName',
  //use this authenticate middleware to get user id and info
  passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    if (!(req.body.newFirst && req.body.newLast)) {
      return res.status(400).json({
        success: false,
        error: "Please select what part of your name you'd like to change.",
      });
    }

    if (req.body.newFirst) {
      User.findOneAndUpdate(
        { _id: req.user.id },
        { $set: { name: { first: req.body.newFirst } } },
        function (err) {
          if (err) return res.status(400).json({ success: false, err: err });
        },
      );
    }

    if (req.body.newLast) {
      User.findOneAndUpdate(
        { _id: req.user.id },
        { $set: { name: { last: req.body.newLast } } },
        function (err) {
          if (err) return res.status(400).json({ success: false, err: err });
        },
      );
    }

    return res
      .status(200)
      .json({ success: true, message: 'Name changed successfully!' });
  },
);

app.get(
  '/api/searchUserByEmail',
  passport.authenticate('jwt', { session: false }),
  // searches for a SINGLE USER
  async function (req, res) {
    if (!req.body.searchEmail) {
      return res
        .status(400)
        .json({ success: false, err: 'Search query left empty' });
    }
    User.findOne({ email: req.body.searchEmail }, function (err, found) {
      if (err) return res.status(400).json({ success: false, err: err });
      if (!found) {
        return res.status(200).json({
          success: true,
          message: 'No user with the searched email was found.',
        });
      }
      return res.status(200).json({ success: true, found: found });
    });
  },
);

app.get(
  '/api/findUserByEmail/:email',
  passport.authenticate('jwt', { session: false }),
  // searches for a SINGLE USER
  async function (req, res) {
    if (!req.params.email) {
      return res
        .status(400)
        .json({ success: false, err: 'Search query left empty' });
    }

    User.findOne({ email: req.params.email }, function (err, found) {
      if (err) return res.status(400).json({ success: false, err: err });
      if (!found) {
        return res
          .status(200)
          .json({ success: false, message: 'No user found with this email.' });
      }
      return res.status(200).json({ success: false, user: found });
    });
  },
);

// created by the logged in user who wants to invite a friend to WTD
// other friend is :id
app.post(
  '/api/createNewInviteNotif/:id',
  //use this authenticate middleware to get user id and info
  passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    if (!req.params.id) {
      return res.status(400).json({ success: false, err: 'Invalid userID' });
    }
    // assumes users already follow one another

    const user = await User.findOne({ _id: req.user.id });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, err: 'Something went wrong!' });
    }

    const newNotif = new invitedNotif({
      read: false,
      title: 'You have been added to a WantToDo!',
      description: {
        date: Date.now(),
        invitedBy: user,
      },
    });

    newNotif.save(function (err) {
      if (err) return res.status(400).json({ success: false, err: err });
    });

    User.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { inviteNotifs: newNotif } },
      function (err, found) {
        if (err) return res.status(400).json({ success: false, err: err });
        if (!found) {
          return res
            .status(400)
            .json({ success: false, message: 'No user found' });
        }
      },
    );

    const user2 = await User.findOne({ _id: req.params.id });

    return res.status(200).json({ success: true, user: user2 });
  },
);

app.post(
  '/api/setInviteNotifsAsRead/:id',
  //use this authenticate middleware to get user id and info
  passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    if (!req.params.id) {
      return res.status(400).json({ success: false, err: 'Invalid userID' });
    }

    InvitedNotifs.findByIdAndUpdate({ _id: req.params.id }),
      { $set: { read: true } },
      function (err, found) {
        if (err) return res.status(400).json({ success: false, err: err });
        if (!found)
          return res
            .status(400)
            .json({ success: false, err: 'No notif found with ID' });
      };
    return res.status(200).json({ success: true });
  },
);

app.get(
  '/api/test/token',
  //use this authenticate middleware to get user id and info
  passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    console.log(req.user);
    return res.status(200).json({ success: true });
  },
);

const port = 5000 || process.env.PORT;
app.listen(port, () => console.log(`Server on port ${port}`));
