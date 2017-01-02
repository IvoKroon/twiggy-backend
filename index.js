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

io.use(function (socket, next) {
    var handshakeData = socket.request;
    var code = handshakeData._query['code'];
    console.log(socket.id);

    DemoUser.findOne({hash: code}, function (err, user) {
        if (user) {
            //update the socket id
            user.socket_id = socket.id;
            user.save(function (err, updateUser) {
                console.log("Found and updated");
                next();
            });
        } else {
            console.log("Not found");
            return false;
        }
    });
});

io.on('connection', function (socket, fn) {
    console.log(fn);
    console.log(socket.id);
    // DemoUser.findOne({socket_id: socket.id}, function (err, user) {
    //     Resources.findOne({_id: user.resources_id}, function (err, resources) {
    //         console.log(resources);
    //     });
    //     //send first data....
    // });

    getUserData(socket, function (err, data, user, plots) {
        var user_data = {
            resources: {water: data.water, energy: data.energy, coin: data.coin, diamond: data.diamond},
            plots: plots
        };
        socket.emit('setup', user_data)
    });

    socket.on('disconnect', function () {
        console.log('disconnected');
        gameLoop.clearGameLoop(loop);
    });

    socket.on('growButtonClick', function (data, fn) {
        fn(true);
        //TODO check if tree is of the user
        //TODO check if there are enough resources
    });

    socket.on('plantTree', function (data, fn) {
        if (data) {
            //check if the plot exists
            console.log(data);
            Plot.findOne({_id: data.plotId}, function (err, plot) {
                if (data) {
                    var plant = new Plant();
                    plant.title = "First apple tree";
                    plant.state_id = 1;
                    plant.species_id = 1;
                    console.log(plant);
                    plant.save(function (err, newPlant) {
                        console.log("plant");
                        console.log(err);
                        console.log(newPlant);
                        plot.plant_id = newPlant._id;
                        plot.save(function (err, newPlot) {
                            if (newPlot) {
                                //TODO send back new plant via socket....
                                console.log(newPlant);
                                var newPlotData = {plot: plot, plant: newPlant};
                                fn(newPlotData);
                            }
                        })
                    })
                }
            })
        } else {
            console.log("Error");
        }
        //Make a new Tree.
        // console.log(data);
        // fn({success:"WHOOEES"});
    });


    var loop = gameLoop.setGameLoop(function (delta) {
        gamePlay(socket);
    }, 1000);
});

function gamePlay(socket) {
    getUserData(socket, function (err, resource, user, plots) {
        resource.water += 0.01;
        resource.energy += 1.67;
        resource.coin += 0.03;
        resource.diamond += 1;
        resource.save(function (err, resource) {
            if (err) {
                // console.log("Error");
            } else {
                // console.log("Success")
            }
            socket.emit('user_data', {resources: resource, plots: plots});
        })
    });
}

function getUserData(socket, success) {
    DemoUser.findOne({socket_id: socket.id}, function (err, user) {
        // console.log("res "+user.resources_id);
        Resources.findOne({_id: user.resources_id}, function (err, data) {
            Plot
                .find({user_id: user._id})
                .populate('plant_id')
                .exec(function (err, plots) {
                    if (!err) {
                        success(err, data, user, plots);

                    } else {
                        console.log("Getting resources");
                    }
                });
            //send first data....
        });

    });
}

// MAYBE FOR LATER.......
function POPULATEgetUserData(socket, success) {
    DemoUser.findOne({socket_id: socket.id}, function (err, user) {
        // console.log("res "+user.resources_id);
        Resources.findOne({_id: user.resources_id}, function (err, data) {
            Plot
                .find({user_id: user._id})
                .populate([{
                        path: 'plant_id',
                        model: 'Plant',
                        populate: {
                            path: 'state_id',
                            model: 'State'
                        }
                    },
                    {
                        path: 'plant_id',
                        model: 'Plant',
                        populate: {
                            path: 'species_id',
                            model: 'Specie'
                        }
                    }])
                .exec(function (err, plots) {
                    if (!err) {
                        console.log("plot");
                        console.log(plots[0].plant_id);
                        success(err, data, user, plots);

                    } else {
                        console.log(err);
                    }
                });
            //send first data....
        });

    });
}

// END: MAYBE FOR LATER.......

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

http.listen(4000, function () {
    console.log('listening on *:80');
});

