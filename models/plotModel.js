var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var plotModel = new Schema({
    title:String,
    location:Number,
    user_id: {type: Schema.ObjectId, ref: 'User'},
    region: {type: Number, ref: 'Region'},
    plant_id: {type: Schema.ObjectId, ref: 'Plant'}
});

module.exports = mongoose.model('Plot', plotModel);
