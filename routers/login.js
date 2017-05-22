const express = require('express');
let router = express.Router();

const User = require('../models/User');

router.get('/', (req, res) => {
  res.render('login');
});

router.post('/', (req, res, next) => {
  const {username} = req.body;
  User.findOrCreate({username}, (err, user) => {
    
  }
});

module.exports = router;
