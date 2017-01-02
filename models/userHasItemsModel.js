var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userHasItemsModel = new Schema({
    user_id: [{type: Schema.Types.ObjectId, ref: 'User'}],
    item_id: [{type: Schema.Types.ObjectId, ref: 'Item'}],
    amount: {type:Number, default:0},
    total: {type:Number, default:0}
});

module.exports = mongoose.model('UserHasItems', userHasItemsModel);
