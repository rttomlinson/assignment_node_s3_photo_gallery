const mongoose = require('mongoose');
const bluebird = require('bluebird');

mongoose.Promise = bluebird;

let models = {};

models.User = require('./User');
models.Photo = require('./Photo');

module.exports = models;