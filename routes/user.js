const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');

const User = require('../models/User');

router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: 'Email already exists' });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });
      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

router.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email }).then(user => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ emailnotfound: 'Email not found' });
    }
    // Check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        const payload = {
          id: user.id,
          name: user.name,
        };
        jwt.sign(
          payload,
          'secret',
          {
            expiresIn: 31556926,
          },
          (err, token) => {
            res.json({
              success: true,
              token: 'Bearer ' + token,
            });
          },
        );
      } else {
        return res
          .status(400)
          .json({ passwordincorrect: 'Password incorrect' });
      }
    });
  });
});

router.post('/api/updateNotifs', async function (req, res) {
  // interaction: mark as read or mark all as read
  // User.findOne(logged in userID)
  // populate notifications array
  // change {read: false} to {read: true}
  // res.send updated notif(s)
});

router.get('/api/viewFollowers', async function (req, res) {
  // User.findOne(logged in userID)
  // populate followers array
  // return user followers
});

router.get('/api/viewFollowing', async function (req, res) {
  // User.findOne(logged in userID)
  // populate following array
  // return following
});

router.post('/api/unfollow', async function (req, res) {
  // User.findOne(logged in userID)
  // access following array
  // in following array, search for userID to be unfollowed
  // splice
  // return updated following array
});

router.post('/api/follow', async function (req, res) {
  // User.findOne(logged in userID)
  // access following array
  // in following array, search for userID to be followed
  // push (or unshift)
  // return updated following array
});

router.get(
  '/api/test/token',
  //use this authenticate middleware to get user id and info
  passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    console.log(req.user);
    return res.status(200).json({ success: true });
  },
);

module.exports = router;
