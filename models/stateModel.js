var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var stateModel = new Schema({
    _id:Number,
    sprite:String,
    energy:Number,
    water:Number,
    grow_speed:Number,
    item_grow_speed:Number
});

module.exports = mongoose.model('State', stateModel);
