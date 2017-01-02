var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var loginHistoryModel = new Schema({
    login_time: { type : Date, default: Date.now },
    logout_time: { type : Date, default: Date.now },
    user_id: {type: Schema.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('LoginHistory', loginHistoryModel);
