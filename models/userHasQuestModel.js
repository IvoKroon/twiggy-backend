var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userHasQuestModel = new Schema({
    user_id: {type: Schema.Types.ObjectId, ref: 'User'},
    quest_id: {type: Schema.Types.ObjectId, ref: 'Quest'},
    done:{type:Boolean, default:false}
});

module.exports = mongoose.model('UserHasQuest', userHasQuestModel);
