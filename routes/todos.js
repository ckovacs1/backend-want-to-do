const express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  toDos = require('../models/WantToDos');
const passport = require('passport');
const User = require('../models/User');
const { getTodosByRepetition } = require('../service/todos');
require('../config/passport')(passport);

const currentMonth = new Date().getMonth();
console.log(currentMonth);

const currentYear = new Date().getFullYear();
console.log(currentYear);

const currentDay = new Date().getDate();
console.log(currentDay);

const fromDateM = new Date(currentYear, currentMonth, 1);
const toDateM = new Date(fromDateM.getFullYear(), fromDateM.getMonth() + 1, 0);

const fromDateW = new Date(currentYear, currentMonth, currentDay);
const toDateW = new Date(
  fromDateW.getFullYear(),
  fromDateW.getMonth(),
  currentDay + 7,
);

const fromDateD = new Date(currentYear, currentMonth, currentDay);
const toDateD = new Date(
  fromDateD.getFullYear(),
  fromDateD.getMonth(),
  currentDay + 1,
);

console.log(fromDateD);
console.log(toDateD);
const conditionM = { startDateTime: { $gte: fromDateM, $lte: toDateM } };
const conditionW = { startDateTime: { $gte: fromDateW, $lte: toDateW } };
const conditionD = { startDateTime: { $gte: fromDateD, $lte: toDateD } };

const transactionOptions = {
  readPreference: 'primary',
  readConcern: { level: 'local' },
  writeConcern: { w: 'majority' },
  maxCommitTimeMS: 1000,
};

router.post(
  '/createtoDos',
  passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    const body = req.body;

    if (!body) {
      return res.status(400).json({
        success: false,
        error: 'You must provide a todo',
      });
    }

    // Add repeat
    req.body.repeat = [];
    for (let i = 0; i < req.body.repetition - 1; i++) {
      req.body.repeat.push({
        complete: false,
      });
    }

    // Save friend's todos
    const friendIds = req.body.inviteFriends;

    for (let friendId of friendIds) {
      const toDo = new toDos(req.body);
      toDo.user = friendId;
      toDo.save().then();
    }

    // Save my todo
    const toDo = new toDos(req.body);
    toDo.user = req.user.id;

    if (!toDo) {
      return res.status(400).json({ success: false, error: err });
    }

    toDo
      .save()
      .then(() => {
        return res.status(201).json({
          success: true,
          id: toDo._id,
          message: 'todo created!',
        });
      })
      .catch(error => {
        return res.status(400).json({
          error,
          message: 'todo not created!',
        });
      });
  },
);

//if want only view unfinished to-dos, do a .find with added complete: false in find parameter
router.get(
  '/viewtoDos',
  passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    await toDos
      .find({ user: req.user.id }, (err, alltoDos) => {
        if (err) {
          return res.status(400).json({ success: false, error: err });
        }
        if (!alltoDos.length) {
          return res
            .status(404)
            .json({ success: false, error: `toDo not found` });
        }
        return res.status(200).json({ success: true, data: alltoDos });
      })
      .catch(err => console.log(err));
  },
);

//current month
router.get(
  '/viewtoDosMonth',
  passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    await toDos
      .find(
        {
          user: req.user.id,
          startDateTime: { $gte: fromDateM, $lte: toDateM },
        },
        (err, alltoDos) => {
          if (err) {
            return res.status(400).json({ success: false, error: err });
          }
          if (!alltoDos.length) {
            return res
              .status(404)
              .json({ success: false, error: `toDo not found` });
          }
          return res.status(200).json({ success: true, data: alltoDos });
        },
      )
      .catch(err => console.log(err));
  },
);

//7 days ahead
router.get(
  '/viewtoDosWeek',
  passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    await toDos
      .find(
        {
          user: req.user.id,
          startDateTime: { $gte: fromDateW, $lte: toDateW },
        },
        (err, alltoDos) => {
          if (err) {
            return res.status(400).json({ success: false, error: err });
          }
          if (!alltoDos.length) {
            return res
              .status(404)
              .json({ success: false, error: `toDo not found` });
          }
          return res.status(200).json({ success: true, data: alltoDos });
        },
      )
      .catch(err => console.log(err));
  },
);

//2 days ahead
router.get(
  '/viewtoDosDay',
  passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    await toDos
      .find(
        {
          user: req.user.id,
        },
        (err, alltoDos) => {
          if (err) {
            return res.status(400).json({ success: false, error: err });
          }
          if (!alltoDos.length) {
            return res
              .status(404)
              .json({ success: false, error: `toDo not found` });
          }

          // get all todos by repeat
          allRepeattoDos = alltoDos.reduce(
            (prev, todo) => prev.concat(getTodosByRepetition(todo)),
            [],
          );

          return res.status(200).json({ success: true, data: allRepeattoDos });
        },
      )
      .catch(err => console.log(err));
  },
);

router.delete(
  '/deletetoDos/:id',
  passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    await toDos
      .findOneAndDelete(
        { user: req.user.id, _id: req.params.id },
        (err, toDo) => {
          console.log(toDo);
          if (err) {
            return res.status(400).json({ success: false, error: err });
          }

          if (!toDo) {
            return res
              .status(404)
              .json({ success: false, error: `toDo not found` });
          }

          return res.status(200).json({ success: true, data: toDo });
        },
      )
      .catch(err => console.log(err));
  },
);

router.get(
  '/viewtoDoById/:id',
  passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    await toDos
      .findOne({ user: req.user.id, _id: req.params.id }, (err, toDo) => {
        if (err) {
          return res.status(400).json({ success: false, error: err });
        }

        if (!toDo) {
          return res
            .status(404)
            .json({ success: false, error: `toDo not found` });
        }
        return res.status(200).json({ success: true, data: toDo });
      })
      .catch(err => console.log(err));
  },
);

router.put(
  '/completetoDo/:id',
  passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    const body = req.body;

    const repeatIdx = body.repeatIdx; // null or Number

    if (!body) {
      return res.status(400).json({
        success: false,
        error: 'You must provide a body to update',
      });
    }
    toDos.findOne({ user: req.user.id, _id: req.params.id }, (err, toDo) => {
      if (err) {
        return res.status(404).json({
          err,
          message: 'toDo not found!',
        });
      }

      if (repeatIdx !== null) {
        const repeat = toDo.repeat[repeatIdx];
        repeat.complete = !repeat.complete;
      } else {
        toDo.complete = !toDo.complete;
      }

      toDo
        .save()
        .then(() => {
          return res.status(200).json({
            success: true,
            id: toDo._id,
            message: 'toDo updated!',
          });
        })
        .catch(error => {
          return res.status(404).json({
            error,
            message: 'toDo not updated!',
          });
        });
    });
  },
);

router.get(
  '/deleteAllToDos',
  //use this authenticate middleware to get user id and info
  passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    User.findByIdAndUpdate(
      { _id: req.user.id },
      { $set: { toDos: [] } },
      function (err) {
        if (err) return res.status(200).json({ success: false });
      },
    );
    return res
      .status(200)
      .json({ success: true, message: 'Your WantToDos have been cleared.' });
  },
);

module.exports = router;
