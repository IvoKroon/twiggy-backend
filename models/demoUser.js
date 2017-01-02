var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var demoUserModel = new Schema({
    hash:String,
    resources_id: {type: Schema.Types.ObjectId, ref: 'Resources'},
    socket_id:String
});

module.exports = mongoose.model('DemoUser', demoUserModel);
