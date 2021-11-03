//Import the User model
var History = require("../models/history");
var User = require("../models/user");
var Player = require("../models/player");
var Team = require("../models/team");
var jwt = require('jsonwebtoken');
var aflSecrete = "IamVerySecreteWhereYoucouldnotFineMe";
var fs = require('fs');
var csv = require('fast-csv');


module.exports = function (router) {
    //Set all the user have point to 0 when start program.
    User.updateMany({}, { $set: { Point: 0 } }, function (err, update) {
        if (err) {
            console.log("update quiz");
        } else {
            console.log(update);
        }
    });
    // History.collection.drop();
    History.collection.remove({});
    var timeString;
    Date.prototype.addDays = function (days) {
        var date = new Date("Oct 4, 2021 12:08:00");
        date.setDate(date.getDate() + days);
        return date;
    }
    var date = new Date();
    var d = 0;
    var Round = [];
    var getRound = [];
    for (var round = 1; round <= 21; round++) {
        var valueDay = date.addDays(d);
        d += 3 / (24 * 60)
        getRound.push(valueDay);
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        //console.log(valueDay);

        var value = { "Round": round, "Date": valueDay.getHours() + " hours " + valueDay.getMinutes() + " minutes " + valueDay.getSeconds() + " seconds, at " + valueDay.getDate() + " " + months[valueDay.getMonth()] + " " + valueDay.getFullYear() }
        Round.push(value);
    }

    var index = 0;
    console.log(getRound[0].getTime());
    var countDownDate = getRound[index].getTime();



    function intervalFunc() {

        //Get todays date and time
        var now = new Date().getTime();

        // Find the distance between now and the count down date
        var distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Output the result in an element with id="demo"
        timeString = "Round Week " + (index + 1) + ", Deadline: " + days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
        //console.log(timeString);
        // If the count down is over, write some text 
        if (distance <= 0) {
            index++;
            console.log(index);
            if (index == 20) {
                clearInterval(this);
            }
            countDownDate = getRound[index].getTime();
            UpdateQuizAtemt();
            UpdatePlayerTable();

        }
    }

    setInterval(intervalFunc, 1000);
    function UpdateQuizAtemt() {
        //console.log("update quiz");
        User.updateMany({}, { $set: { QuizAtemp: false } }, function (err, update) {
            if (err) {
                console.log("update quiz");
            } else {
                //console.log(update);
            }
        });

    }
    function UpdatePlayerTable() {
        fs.createReadStream('static.csv')
            .pipe(csv())
            .on('data', function (element) {
                //console.log(data);
                if (element[4] == index) {
                    var currentValue = 0;
                    for (var i = 5; i <= 27; i++) {
                        currentValue += Number(element[i]);
                    }
                    Player.findOne({ playerName: element[0] }).select("Value").exec(function (err, result) {
                        if (err) {
                            console.log(err);
                        } else {
                            //console.log("Value ----" + result);
                            if (result != null) {

                                var performance = currentValue - result.Value;
                                console.log("result.Value ----" + result.Value);
                                console.log("currentValue ----" + currentValue);
                                console.log("performance ----" + performance);
                                {
                                    Player.update({ playerName: element[0] }, { $set: { Value: currentValue, Performance: performance } }).exec(function (err, result) {
                                        if (err) {
                                        }
                                        else {
                                            console.log(result);
                                        }
                                    });
                                }
                            }
                        }
                    });
                }
            })
            .on('end', function (data) {
                console.log('UP DATE finished');
                //Update User database
                UpdatePointSystem(index);
            });
    }

    function UpdatePointSystem(index) {
        Team.aggregate([
            {
                $group: { _id: "$userID", players: { $push: "$playerID" } }
            }
        ]).exec(function (error, result) {
            // ids is an array of all ObjectIds
            result.forEach(function (item) {
                //console.log("id " + item._id + " value" + item.players);
                var totalPoint = 0;
                item.players.forEach(function (playerID) {
                    //console.log("id" + item._id + " array " + playerID);
                    Player.find({ _id: playerID }).select("playerName").exec(function (err, result2) {
                        result2.forEach(function (playerName) {
                            //asyncCall(index, playerName.playerName,userid)
                            var sequentialStart = async function () {
                                const playerPoint = await GetPlayerPoint(index, playerName.playerName);
                                totalPoint += playerPoint.Point;
                                //console.log("Point " + slow.Point + " Id "+ item._id);

                            }
                            sequentialStart();

                        });
                    });
                });
                setTimeout(() => {
                    //Save to the user earn point history 
                    var history = new History();
                    history.userID = item._id;
                    history.Point = totalPoint
                    history.save(function (err, value) {
                        if (err) {
                            console.log(err);
                        } else {
                            //console.log("history" + value);
                        }
                    });

                    //console.log("id" + item._id + "total Point " + totalPoint);
                    User.findOne({ _id: item._id }).select("Point").exec(function (err, result) {
                        if (err) {
                            console.log(err);
                        } else {
                            //console.log("result point " + result.Point);
                            var PointOveral = result.Point + totalPoint;
                            UpdatePoint(PointOveral);
                        }
                    });
                    function UpdatePoint(PointOveral) {
                        User.findByIdAndUpdate(item._id, { $set: { Point: PointOveral } }, { new: true }, function (err, update) {
                            if (err) {
                                console.log("Team name has already existed");
                            } else {
                                //console.log(update);
                            }
                        });
                    }

                }, 9000);

            });

        });
    }
    var GetPlayerPoint = function (index, playerName) {
        //console.log("index get Player Point function" + index);
        //var value;
        var point = 0;

        fs.createReadStream('static.csv')
            .pipe(csv())
            .on('data', function (element) {
                if (element[4] == index && element[0] == playerName) {

                    for (var i = 5; i <= 27; i++) {
                        point += Number(element[i]);
                    }

                    //value = "User id " + userid + " Player name " + playerName + " Point " + point;
                }
            })
            .on('end', function (data) {
                //console.log('Update finished' + point);

            })
        return new Promise(resolve => {

            setTimeout(() => {
                resolve({ Point: point });
            }, 7000);
        });
    }
    //*****Get Time*/
    router.get('/getTime', function (req, res) {
        // console.log("request recieved" + timeString);
        res.json({ success: true, Time: timeString, round: Round });
    });

    router.post('/CheckQuizAtempt', function (req, res) {
        console.log("check Atemp" + req.body.id);
        User.findOne({ _id: req.body.id }).select("QuizAtemp").exec(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                //console.log("Atempt " + result.QuizAtemp);
                res.json({ success: true, Atempt: result.QuizAtemp });
            }
        });
    });
    //***** CheckQuiz*/
    router.post('/CheckQuiz', function (req, res) {
        console.log("Get point" + req.body.id);
        console.log("first " + req.body.FirstQuestion);
        console.log("second " + req.body.SecondQuestion);
        var gainPoint = 0;
        if (req.body.FirstQuestion == "Geloong 100 - Melbourne 98") {
            gainPoint += 5;
        }
        if (req.body.SecondQuestion == "Billie Smedts") {
            gainPoint += 5;
        }
        console.log("Gain Point" + gainPoint);
        //Save to the user earn point history 
        var history = new History();
        history.userID = req.body.id;
        history.Point = gainPoint
        history.save(function (err, value) {
            if (err) {
                console.log(err);
            } else {
                //console.log("history" + value);
            }
        });



        User.findOne({ _id: req.body.id }).select("Point TeamName").exec(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log("result point " + result.Point);
                var totolPoint = result.Point + gainPoint;
                UpdatePoint(totolPoint);
                res.json({ success: true, point: gainPoint });
            }
        });
        function UpdatePoint(totolPoint) {
            console.log(totolPoint);
            User.findByIdAndUpdate(req.body.id, { $set: { Point: totolPoint, QuizAtemp: true } }, { new: true }, function (err, update) {
                if (err) {
                    console.log("Team name has already existed");
                } else {
                    console.log(update);
                }
            });
        }

    });


    //*****Insert Player Name and team*/
    router.post('/InsertPlayerTable', function (req, res) {
        console.log("InsertPlayerTable");

        var array = [];
        fs.createReadStream('static.csv')
            .pipe(csv())
            .on('data', function (element) {
                if (element[4] == 23) {
                    switch (element[2]) {
                        case "ES":
                            element[2] = "Essendon";
                            break;
                        case "RI":
                            element[2] = "Richmond";
                            break;
                        case "AD":
                            element[2] = "Adelaide";
                            break;
                        case "BL":
                            element[2] = "Brisbane";
                            break;
                        case "CA":
                            element[2] = "Carlton";
                            break;
                        case "CW":
                            element[2] = "Collingwood";
                            break;
                        case "FR":
                            element[2] = "Fremantle";
                            break;
                        case "GE":
                            element[2] = "Geelong";
                            break;
                        case "GC":
                            element[2] = "Gold Coast";
                            break;

                        case "GW":
                            element[2] = "Greater Western Sydney";
                            break;
                        case "HW":
                            element[2] = "Hawthorn";
                            break;
                        case "ME":
                            element[2] = "Melbourne";
                            break;
                        case "NM":
                            element[2] = "North Melbourne";
                            break;
                        case "PA":
                            element[2] = "Port Adelaide";
                            break;
                        case "SK":
                            element[2] = "St Kilda";
                            break;
                        case "SY":
                            element[2] = "Sydney";
                            break;
                        case "WC":
                            element[2] = "West Coast";
                            break;
                        case "WB":
                            element[2] = "Western Bulldogs";
                            break;
                        default:
                    }
                    var value = 0;
                    for (var i = 5; i <= 27; i++) {
                        value += Number(element[i]);
                    }
                    //console.log(value);
                    var player = new Player();
                    var imLink = "images/players/" + element[0] + ".png";
                    console.log(imLink);
                    player.imageLink = imLink;
                    player.playerName = element[0];

                    player.TeamName = element[2];
                    player.Value = value;
                    player.save(function (err, value) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(value);
                        }
                    });
                    array.push(element);
                }
            })
            .on('end', function (data) {
                console.log('read finished');
                //console.log(array.length);
                res.json({ success: true, result: array });
            });
    });

    //*****Check team name, it is only allow unique team name*/
    router.post('/GetMyPoint', function (req, res) {
        console.log("Get point" + req.body.userId);
        //Look at the Player DB 
        User.findOne({ _id: req.body.userId }).select("Point TeamName Money").exec(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log("result" + result);
                res.json({ success: true, point: result.Point, teamName: result.TeamName, money: result.Money });

            }
        });


    });
    //*****Add To My Collection */
    router.post('/AddToMyTeam', function (req, res) {
        console.log("Add to my team");
        console.log(req.body.id);
        //console.log(req.body.player);
        var totalValue = 0;
        req.body.player.forEach(element => {
            totalValue += element.Value;
        });
        console.log("Total valueL" + totalValue);
        var totalMoneyRemain;
        User.findOne({ _id: req.body.id }).select("Money").exec(function (err, result) {
            if (err) {
            }
            else {
                console.log("2view current moeny" + result.Money);
                totalMoneyRemain = result.Money - totalValue;
                if (totalMoneyRemain < 0) {
                    res.json({ success: false, message: 'You spend exceed your amount' });
                } else {
                    User.findByIdAndUpdate(req.body.id, { $set: { TeamName: req.body.teamName, Money: totalMoneyRemain } }, { new: true }, function (err, update) {
                        if (err) {
                            console.log("Team name has already existed");
                            res.json({ success: false, message: 'Team name has already existed' });
                        } else {
                            Team.deleteMany({ userID: req.body.id }, function (err) {
                                if (err) {
                                    console.log(err);
                                    res.json({ success: false, message: err });
                                }
                                else {
                                    console.log("Deleted the team that match the player");
                                    for (var i = 0; i < req.body.player.length; i++) {
                                        //console.log(req.body.player[i]);
                                        var team = new Team();
                                        team.playerID = req.body.player[i];
                                        team.userID = req.body.id;
                                        team.save(function (err) {
                                            if (err) {
                                                console.log(err);
                                            }
                                        });
                                    }
                                    setTimeout(function () {
                                        res.json({ success: true });
                                    }, 1000);

                                }

                            });
                        }

                    });
                }


            }


        });

        // setTimeout(function () {
        //     console.log("total reamin " + totalMoneyRemain);

        //     User.findByIdAndUpdate(req.body.id, { $set: { TeamName: req.body.teamName, Money: totalMoneyRemain } }, { new: true }, function (err, update) {
        //         if (err) {
        //             console.log("Team name has already existed");
        //             res.json({ success: false, message: 'Team name has already existed' });
        //         } else {
        //             Team.deleteMany({ userID: req.body.id }, function (err) {
        //                 if (err) {
        //                     console.log(err);
        //                     res.json({ success: false, message: err });
        //                 }
        //                 else {
        //                     console.log("Deleted the team that match the player");
        //                     for (var i = 0; i < req.body.player.length; i++) {
        //                         //console.log(req.body.player[i]);
        //                         var team = new Team();
        //                         team.playerID = req.body.player[i];
        //                         team.userID = req.body.id;
        //                         team.save(function (err) {
        //                             if (err) {
        //                                 console.log(err);
        //                             }
        //                         });
        //                     }
        //                     setTimeout(function () {
        //                         res.json({ success: true });
        //                     }, 1000);

        //                 }

        //             });
        //         }

        //     });
        // }, 2000);
    });

    //*****View Player pool */
    router.post('/ViewPlayerPool', function (req, res) {
        //Look at the Player DB 
        Player.find({}).exec(function (err, result) {
            if (err) {
                console.log(err);
            } else {

                res.json({ success: true, collections: result });
            }
        });

    });
    //*****View Player by ID */
    router.post('/ViewMyHistory', function (req, res) {
        console.log("¸" + req.body.id);
        History.find({ userID: req.body.id }).select("Point updated").exec(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log("ViewMyHistory" + result);
                res.json({ success: true, collections: result });
            }
        });

    });
    //*****View Player by ID */
    router.post('/ViewPlayerID', function (req, res) {
        var playerId = req.body.player;
        console.log(playerId);
        //Look at the Player DB 
        Player.find({ _id: playerId }).exec(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                res.json({ success: true, collections: result });

            }
        });

    });
    //*****View my current ranking */
    router.post('/ViewMyCurrentRank', function (req, res) {
        console.log("ViewMyCurrentRank" + req.body.id);
        User.find({ Point: { $gt: -1 } }).sort('-Point').exec(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                // console.log(result);
                var i = 0;
                result.forEach(function (item) {
                    i++;
                    console.log(item._id);
                    //Look at the Player DB 
                    if (item._id == req.body.id) {
                        console.log("index" + i);
                        res.json({ success: true, result: i });
                    }

                });

            }
        });

    });
    //*****View All User Point */
    router.post('/UpdatePlayerValue', function (req, res) {
        fs.createReadStream('static.csv')
            .pipe(csv())
            .on('data', function (element) {
                //console.log(data);
                if (element[4] == index) {
                    var value = 0;
                    for (var i = 5; i <= 27; i++) {
                        value += Number(element[i]);
                    }
                    var query = { playerName: element[0] };
                    Player.update(query, { Value: value }).exec(function (err, result) {
                        if (err) {

                        }
                        else {
                            console.log(result);

                        }
                    });
                }

            })
            .on('end', function (data) {

                console.log('read finished');
                res.json({ success: true });

            });
    });
    //*****View All User Point */
    router.post('/PlayerStatic', function (req, res) {
        console.log("PlayerStatic");
        var array = [];
        fs.createReadStream('static.csv')
            .pipe(csv())
            .on('data', function (data) {
                //console.log(data);
                if (data[4] == index) {
                    array.push(data);
                }
                //res.json({ success: true, result: data });
            })
            .on('end', function (data) {
                //console.log(array);
                console.log('read finished');
                res.json({ success: true, result: array, round: index });
            });
    });
    //*****View All User Point */
    router.get('/Leaderboard', function (req, res) {


        User.find({ Point: { $gt: -1 } }).sort('-Point').exec(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                var i = 0;
                var AddJason = [];
                result.forEach(function (item) {
                    i++;
                    var data = [{ index: i }];
                    data.push(item);
                    AddJason.push(data);
                });
                setTimeout(function () {
                    res.json({ success: true, result: AddJason });
                }, 1000);


            }
        });

    });
    //*****View User team */
    router.post('/ViewMyTeam', function (req, res) {

        var userId = req.body.userId;
        //console.log("ViewMyteam" + userId)
        var array = [];
        Team.find({ userID: userId }).select("playerID").exec(function (err, result) {
            // console.log(result);
            result.forEach(function (item) {
                //Look at the Player DB 
                Player.findOne({ _id: item.playerID }).exec(function (err, inresult) {
                    // console.log(inresult)
                    //Add to the Player collectoin
                    array.push(inresult);
                });
            });
            setTimeout(function () {
                // console.log(array);
                res.json({ success: true, collections: array });
            }, 1000);

        });
    });
    //*****Get player detail */
    router.post('/getPlayerDetail', function (req, res) {
        console.log(req.body.id);
        Player.findOne({ _id: req.body.id }).exec(function (err, result) {
            if (err) {
                console.log("error" + err);
                throw err;
            }
            if (!result) {
                console.log("result");
                res.json({ success: false, message: "Could not get job detail" });
            }
            else {
                console.log("pass");
                res.json({ success: true, result: result });
            }
        });
    });
    //*****Add player details*/
    router.post('/AddPlayer', function (req, res) {
        var player = new Player();
        player.imageLink = req.body.imageLink;
        player.playerName = req.body.playerName;
        //player.point = req.body.point;
        console.log(player);

        player.save(function (err) {
            if (err) {
                res.json({ success: false, message: 'Unable to save to the database', m: err });
                return;
            }

            res.json({ success: true, message: 'Player created!' });

        });
    });


    //*****User route**********
    //Login route
    router.post('/Login', function (req, res) {
        //Check the password is empty or not
        req.checkBody('username', 'Username is required').notEmpty();
        req.checkBody('password', 'Password is required').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            res.json({ success: false, message: "Username, password was left empty" });
        }
        else {
            //look at the database to get the username, password and email base on the username
            User.findOne({ username: req.body.username }).select("_id username password email").exec(function (err, result) {
                if (err) {
                    throw err;
                }
                if (!result) {
                    res.json({ success: false, message: "Could not authenticated user" });
                }
                else if (result) {
                    var valid = result.ComparePassword(req.body.password);
                    if (!valid) {
                        res.json({ success: false, message: "Could not authenticated password" });
                    }
                    else {
                        //generate the token
                        var token = jwt.sign({ _id: result._id, username: result.username, email: result.email }, aflSecrete, { expiresIn: '2h' });
                        res.json({ success: true, message: "User authenticated", id: result._id, token: token, username: result.username });

                    }
                }

            });
        }
    });
    //Register route
    router.post('/Register', function (req, res) {

        // Validation prior to checking DB. Front end validation exists, but this functions as a fail-safe
        req.checkBody('username', 'Username is required').notEmpty();
        req.checkBody('password', 'Password is required').notEmpty();
        req.checkBody('email', 'Email is required').notEmpty();
        console.log(req.body.username);
        console.log(req.body);

        var errors = req.validationErrors(); // returns an object with results of validation check
        if (errors) {
            res.json({ success: false, message: 'Username, email or password was left empty' });
            return;
        }


        //Create the user object of the User Model
        var user = new User();
        //Assign the name, password, email
        user.username = req.body.username;
        user.password = req.body.password;
        user.email = req.body.email;
        //Save to the database
        user.save(function (err) {
            if (err) {
                res.json({ success: false, message: err });
                return;
            }
            else {
                res.json({ success: true, message: 'user created!' });
            }
        });
    });

    return router;
}


