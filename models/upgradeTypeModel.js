var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var upgradeTypeModel = new Schema({
    title:String,
    sprite:String,
    price:Number
});

module.exports = mongoose.model('UpgradeType', upgradeTypeModel);
