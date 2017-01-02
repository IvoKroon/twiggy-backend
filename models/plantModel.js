var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var plantModel = new Schema({
    title:String,
    exp:({type:Number, default:0}),
    last_watered:{ type : Date, default: Date.now },
    state_id: {type: Number, ref: 'State'},
    species_id: {type: Number, ref: 'Species'}
});

module.exports = mongoose.model('Plant', plantModel);
