var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var questModel = new Schema({
    title:String,
    description:String,
    start:{type:Number, default:0},
    end:{type:Number, default:0}
});

module.exports = mongoose.model('Quest', questModel);
