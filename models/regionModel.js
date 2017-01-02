var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var regionModel = new Schema({
    id: Number,
    title:String
});

module.exports = mongoose.model('Region', regionModel);
