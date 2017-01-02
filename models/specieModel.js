var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var specieModel = new Schema({
    _id:Number,
    title:String,
    sprite_map:String,
    item_grow_rate:Number,
    item_id: {type: Schema.Types.Number, ref: 'Item'}
});

module.exports = mongoose.model('Specie', specieModel);
