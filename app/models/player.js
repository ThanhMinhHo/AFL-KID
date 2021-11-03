var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// User Mongoose Schema
var player = new Schema({
    imageLink:{ type: String, required: false},
    playerName: { type: String, required: true},
    TeamName: { type: String, required: true},
    Value: { type: Number, required: false},
    Performance: { type: Number, default: 0},
});
module.exports = mongoose.model('Player',player);

