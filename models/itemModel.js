var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var itemModel = new Schema({
    _id:Number,
    title:String,
    sprite:String,
    sell_price:Number,
    buy_price:Number,
    diamond_price:Number
});

module.exports = mongoose.model('Item', itemModel);
