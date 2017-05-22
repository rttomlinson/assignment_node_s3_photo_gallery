const express = require('express');
let router = express.Router();

const User = require('../models/User');

router.get('/', (req, res) => {
  res.render('login');
});

router.post('/', (req, res, next) => {
  const {username} = req.body;
  User.findOrCreate({username}, (err, user) => {
    if (err) {
        next(err);
    }
    //save id? or save username on the session
    //then we will it off the session id and restore req.user
    console.log("user returned by findOrCreate", user);
    req.session.userId = user.id;
    res.redirect('/photos');
  });
});

module.exports = router;
