var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userModel = new Schema({
    first_name:String,
    last_name:String,
    user_name:String,
    email:String,
    age:Number,
    password:String,
    city:String,
    street:String,
    house_number:String,
    zip_code:String,
    resources_id: {type: Schema.Types.ObjectId, ref: 'Resources'}
});

module.exports = mongoose.model('User', userModel);