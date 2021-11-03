var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// User Mongoose Schema
var history = new Schema({
    userID: { type: String, required: true},
    Point: { type: Number, required: false, lowercase: true, default: 0},
    updated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('History',history);