var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var upgradeModel = new Schema({
    active:Boolean,
    end_time:{ type : Date, default: Date.now },
    user_id: {type: Schema.Types.ObjectId, ref: 'User'},
    upgrade_type_id: {type: Schema.Types.ObjectId, ref: 'UpgradeType'}
});

module.exports = mongoose.model('Upgrade', upgradeModel);
