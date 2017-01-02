var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var resourcesModel = new Schema({
    energy:{type:Number, default:0},
    water:{type:Number, default:0},
    diamond:{type:Number, default:0},
    coin:{type:Number, default:0},
    exp:{type:Number, default:0}
});

module.exports = mongoose.model('Resources', resourcesModel);
