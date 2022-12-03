const express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	toDos = require('../models/WantToDos');


/* const isAuthenticated = (req, res, next) => {
  if(!req.user) {
    res.redirect('/'); 
    console.log('redirecting');
  } else {
    next();
  }
}

router.use(isAuthenticated) */


router.post('/createtoDos', function (req, res) {
    const body = req.body;
  
    if (!body) {
      return res.status(400).json({
        success: false,
        error: 'You must provide a todo',
      });
    }
  
    const toDo = new toDos(req.body);
  
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
  });
  
  router.get('/viewtoDos', async function (req, res) {
    await toDos
      .find({}, (err, alltoDos) => {
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
  });
  
  router.delete('/deletetoDos/:id', async function (req, res) {
    await toDos
      .findOneAndDelete({ _id: req.params.id }, (err, toDo) => {
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
  });
  
  router.get('/viewtoDoById/:id', async function (req, res) {
    await toDos
      .findOne({ _id: req.params.id }, (err, toDo) => {
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
  });
  
  
  router.put('/completetoDo/:id', async function (req, res){
      const body = req.body
  
      if (!body) {
          return res.status(400).json({
              success: false,
              error: 'You must provide a body to update',
          })
      }
      toDos.findOne({ _id: req.params.id }, (err, toDo) => {
          if (err) {
              return res.status(404).json({
                  err,
                  message: 'toDo not found!',
              })
          }
          toDo.complete = true;
          toDo
              .save()
              .then(() => {
                  return res.status(200).json({
                      success: true,
                      id: toDo._id,
                      message: 'toDo updated!',
                  })
              })
              .catch(error => {
                  return res.status(404).json({
                      error,
                      message: 'toDo not updated!',
                  })
              })
      })
  });

module.exports = router