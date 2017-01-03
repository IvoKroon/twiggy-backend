/**
 * Created by ivokroon on 17/11/2016.
 */
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var uuid = require('node-uuid');
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
var gameLoop = require('node-gameloop');

app.use(express.static(__dirname + '/bin/'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//load all the database models.
var db = mongoose.connect("mongodb://localhost/twiggyData");
//load all of the models....
var User = require('./models/userModel');
var State = require('./models/stateModel');
var Plot = require('./models/plotModel');
var Item = require('./models/itemModel');
var LoginHistory = require('./models/loginHistoryModel');
var Plant = require('./models/plantModel');
var Quest = require('./models/questModel');
var Region = require('./models/regionModel');
var Resources = require('./models/resources');
var Specie = require('./models/specieModel');
var Upgrade = require('./models/upgradeModel');
var UpgradeType = require('./models/upgradeTypeModel');
var UserHasQuest = require('./models/userHasQuestModel');
var UserHasItems = require('./models/userHasItemsModel');
var DemoUser = require('./models/demoUser');

var port = process.env.PORT || 4000;

//this is what we do when we connect.
io.use(function (socket, next) {
    //get the data that is send
    var handshakeData = socket.request;
    var code = handshakeData._query['code'];
    //we get the code from the users cookie
    DemoUser.findOne({hash: code}, function (err, user) {
        if (user) {
            //update the socket id
            user.socket_id = socket.id;
            user.save(function (err, updateUser) {
                //TODO catch error if failing...
                //TODO update the values of the resources.
                //send emit with user data
                getUserData(socket, function (err, data, user, plots) {
                    var user_data = {
                        resources: {water: data.water, energy: data.energy, coin: data.coin, diamond: data.diamond},
                        plots: plots
                    };
                    socket.emit('setup', user_data);
                    next();
                });
            });
        } else {
            console.log("Not found");
            return false;
        }
    });
});

io.on('connection', function (socket) {
    //grow a tree
    socket.on('growButtonClick', growButtonClickEvent.bind(socket));
    //plant a tree
    socket.on('plantTree', plantTreeEvent);

    var loop = gameLoop.setGameLoop(function (delta) {
        // console.log("LOOP");
        gamePlay(socket);
    }, 5000);


    //if there is a disconnect clear the gameloop
    socket.on('disconnect', function () {
        console.log('disconnected');
        gameLoop.clearGameLoop(loop);
    });
});

function plantTreeEvent(data,fn) {
    if (data) {
        //check if the plot exists
        Plot.findOne({_id: data.plotId}, function (err, plot) {
            if (data) {
                var plant = new Plant();
                plant.title = "First apple tree";
                plant.state_id = 1;
                plant.species_id = 1;
                plant.save(function (err, newPlant) {
                    plot.plant_id = newPlant._id;
                    plot.save(function (err, newPlot) {
                        Plot(newPlot).populate('plant_id', function (err, plotAndPlant) {
                            if (plotAndPlant) {
                                //FN is the result of the emit
                                fn(plotAndPlant);
                            }
                        });

                    })
                })
            }
        })
    } else {
        console.log("Error");
    }
}

function growButtonClickEvent(data, fn, socket){
    //TODO check if it is the last state.......?
    //TODO Error Handling.
    console.log(socket.id);
    DemoUser.findOne({socket_id: socket.id})
        .populate('resources_id')
        .exec(function (err, user) {
            Plant.findOne({_id: data.treeId})
                .populate('state_id')
                .exec(function (err, plant) {
                    var coastEnergy = plant.state_id.energy;
                    if (user.resources_id.energy > coastEnergy) {
                        State.findOne({_id: plant.state_id._id + 1}, function (err, newState) {
                            console.log(newState);
                            user.resources_id.energy = user.resources_id.energy - coastEnergy;
                            var resources = user.resources_id;
                            var newEnergy = resources.energy;
                            resources.energy = newEnergy - coastEnergy;
                            resources.save(function (err, data) {
                                console.log(err);
                                console.log(data);
                                //TODO check if finale state.
                                plant.state_id = newState;
                                plant.save(function (err, newPlant) {
                                    var returnData = {energy: coastEnergy, plant: newPlant, resources:resources};
                                    fn(returnData);
                                });
                            });
                        });
                    } else {
                        console.log("NOT ENOUGH");
                        fn(false);
                    }

                });
        });
}

//This is the resources handler.
function gamePlay(socket) {
    getUserData(socket, function (err, resource, user, plots) {
        resource.water += 0.01;
        resource.energy += 1.67;
        resource.coin += 0.03;
        resource.diamond += 1;
        resource.save(function (err, resource) {
            //TODO error handling
            if (err) {
                // console.log("Error");
            } else {
                // console.log("Success")
            }
            socket.emit('user_data', {resources: resource, plots: plots});
        })
    });
}
//get the user data
function getUserData(socket, success) {
    DemoUser.findOne({socket_id: socket.id}).populate('resources_id').exec(function (err, user) {
        if(user) {
            Plot
                .find({user_id: user._id})
                .populate('plant_id')
                .exec(function (err, plots) {
                    if (!err) {
                        success(err, user.resources_id, user, plots);
                    } else {
                        console.log("Getting resources");
                    }
                });
            //send first data....
        }else{
            console.log('user not found');
        }
    });
}

//auth the user
function auth(code) {
    DemoUser.findOne({hash: code}, function (err, data) {
        if (data) {
            console.log("Found");
            return true;
        } else {
            console.log("Not found");
            return false;
        }
    })
}

//add a new user.
function addUser(res) {
    var resources = new Resources();
    resources.save(function (err, data) {
        console.log('Saving resources');
        if (err) {
            console.log("error");
            res.setHeader("Access-Control-Allow-Origin", '*');
            res.send({error: "error"})
        } else {
            var hash = uuid.v1();
            var user = new DemoUser();
            user.hash = hash;
            user.resources_id = data._id;
            user.save(function (err, data) {
                console.log('Saving users');
                if (!err) {
                    var plot = new Plot();
                    plot.region = 1;
                    plot.title = "apple tree";
                    plot.location = 1;
                    plot.user_id = data._id;
                    plot.save(function (err, data) {
                        if (!err) {
                            console.log('plot added');
                            res.setHeader("Access-Control-Allow-Origin", '*');
                            res.send({code: hash});
                        } else {
                            console.log("error");
                            res.setHeader("Access-Control-Allow-Origin", '*');
                            res.send({error: "error"})
                        }
                    });
                }
            });
        }
    });
}

app.post('/register', function (req, res) {
    addUser(res);
});

app.post('/login', function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", '*');
    console.log(req.body.code);
    var code = req.body.code;
    DemoUser.findOne({hash: code}, function (err, data) {
        console.log(err);
        console.log(data);
        if (data) {
            code = req.body.code;
            res.send({code: code});
        } else {
            console.log("User not found!");
            addUser(res);
        }
    });
});

http.listen(4000, function () {
    console.log('listening on *:80');
});


// MAYBE FOR LATER.......
// function POPULATEgetUserData(socket, success) {
//     DemoUser.findOne({socket_id: socket.id}, function (err, user) {
//         // console.log("res "+user.resources_id);
//         Resources.findOne({_id: user.resources_id}, function (err, data) {
//             Plot
//                 .find({user_id: user._id})
//                 .populate([{
//                     path: 'plant_id',
//                     model: 'Plant',
//                     populate: {
//                         path: 'state_id',
//                         model: 'State'
//                     }
//                 },
//                     {
//                         path: 'plant_id',
//                         model: 'Plant',
//                         populate: {
//                             path: 'species_id',
//                             model: 'Specie'
//                         }
//                     }])
//                 .exec(function (err, plots) {
//                     if (!err) {
//                         console.log("plot");
//                         console.log(plots[0].plant_id);
//                         success(err, data, user, plots);
//
//                     } else {
//                         console.log(err);
//                     }
//                 });
//             //send first data....
//         });
//
//     });
// }

// END: MAYBE FOR LATER.......
