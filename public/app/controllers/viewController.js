var app = angular.module("indexApp", ['ngRoute']);
app.factory('RestService', function ($http) {
    return {
        // 1st function
        getTimer: function (data, model) {
            return $http({
                method: "get",
                url: "/getTime"
            }).then(function mySuccess(response) {
                if (response.data.success) {
                    return response;
                }
            });
        },
        GetRanking: function (userID) {
            return $http({
                method: "post",
                url: "/ViewMyCurrentRank",
                data: { "id": userID }
            }).then(function mySuccess(response) {
                if (response.data.success)
                    return response;
            });
        },
        GetMyPoint: function (userID) {
            return $http({
                method: "post",
                url: "/GetMyPoint",
                data: { "userId": userID }
            }).then(function mySuccess(response) {
                if (response.data.success)
                    return response
            });
        },
        GetMyPointHistory: function (userID) {
            return $http({
                method: "post",
                url: "/ViewMyHistory",
                data: { "id": userID }
            }).then(function mySuccess(response) {
                if (response.data.success)
                    return response
            });
        },
        GetMyTeam: function (userID) {
            return $http({
                method: "post",
                url: "/ViewMyTeam",
                data: { "userId": userID }
            }).then(function mySuccess(response) {
                if (response.data.success)
                    return response;
            });
        },
        GetLeaderBoard: function () {
            return $http({
                method: "get",
                url: "/Leaderboard"
            }).then(function mySuccess(response) {
                if (response.data.success) {
                    return response;
                }
            });
        },
        GetCheckQuizAtempt: function (userID) {
            return $http({
                method: "post",
                url: "/CheckQuizAtempt",
                data: { "id": userID }
            }).then(function mySuccess(response) {
                if (response.data.success)
                    return response;
            });
        },
        GetPlayerPool: function () {
            return $http({
                method: "post",
                url: "/ViewPlayerPool"
            }).then(function mySuccess(response) {
                if (response.data.success)
                    return response;
            });
        },
        AddToMyTeam: function (id, teamName, playerSelected, totalPoint) {
            return $http({
                method: "post",
                url: "/AddToMyTeam",
                data: { "id": id, "teamName": teamName, "player": playerSelected }
            }).then(function mySuccess(response) {
                return response;
            });
        }
    }

});
app.filter('startFrom', function () {
    return function (input, start) {
        if (input) {
            start = +start;
            return input.slice(start);
        }
        return [];
    };
});
var Question1 =
    [
        { type: "Essendon" },
        { type: "Adelaide" },
        { type: "Brisbane" },
    ];
var Teams =
    [
        { type: "Essendon" },
        { type: "Adelaide" },
        { type: "Brisbane" },
        { type: "Carlton" },
        { type: "Collingwood" },
        { type: "Fremantle" },
        { type: "Geelong" },
        { type: "Gold Coast" },
        { type: "Greater Western Sydney" },
        { type: "Hawthorn" },
        { type: "Melbourne" },
        { type: "North Melbourne" },
        { type: "Port Adelaide" },
        { type: "Richmond" },
        { type: "St Kilda" },
        { type: "Sydney" },
        { type: "West Coast" },
        { type: "Western Bulldogs" },
    ];

app.controller('HeaderController', function ($scope, $window, $location, $window, $rootScope, $http) {
    //When the route change, this function will call
    $rootScope.$on('$routeChangeStart', function () {
        //console.log("Get token" +$window.localStorage.getItem("token"));
        //Get token

        if ($window.localStorage.getItem("token")) {
            $scope.authenticated = true;
            $scope.UserName = $window.localStorage.getItem("username");
            $window.localStorage.getItem("token");

            console.log("user login");
        }

        else {
            $scope.authenticated = false;
            console.log("user is not login");
        }

        if ($window.localStorage.getItem("playerID")) {
            $scope.showCardToAddToCollection = true;
            var array = [];
            array.push($window.localStorage.getItem("playerName"));
            $scope.cards = array;

            console.log("card" + $scope.cards);
        } else {
            console.log("NO");
            $scope.showCardToAddToCollection = false;

        }

    });
    //Logout function when the user click to the logout button
    $scope.logout = function () {
        console.log("user logout");
        $scope.authenticated = false;
        $window.localStorage.removeItem("token");
        $window.localStorage.removeItem("username");
        $location.path('/Home');
    };

});
//******User Login*****/
app.controller('loginController', function ($scope, $http, $location, $window) {
    console.log("this is login controller");
    if ($window.localStorage.getItem("token")) {
        console.log("user login");
        $location.path("/Home");
    }
    $scope.login = function () {
        console.log($scope.loginData);
        $scope.errMessage = false;
        $http({
            method: "post",
            url: "/Login",
            data: $scope.loginData
        }).then(function mySuccess(response) {
            if (response.data.success) {
                //set token to local storage
                $window.localStorage.setItem("token", response.data.token);
                $window.localStorage.setItem("username", response.data.username);
                $window.localStorage.setItem("id", response.data.id);
                console.log(response.data.username);
                console.log(response.data.token);
                console.log("id" + response.data.id);
                //set the error meassage
                $scope.successMsg = response.data.message;
                $location.path("/Home");
            }
            else {
                //console.log(response.data.message);
                $scope.errMessage = response.data.message;
            }
        });
    };
});
//******User Register*****/
app.controller('registerController', function ($scope, $http, $location) {
    console.log("this is register controller");
    $scope.register = function () {
        console.log("This is scope" + $scope.regData.username);
        $scope.errMessage = false;
        $http({
            method: "post",
            url: "/Register",
            data: $scope.regData
        }).then(function mySuccess(response) {
            console.log(response.data.success);
            if (response.data.success) {
                console.log(response.data.message);
                $scope.successMsg = response.data.message;
                $location.path("/login");
            }
            else {
                console.log(response.data.message);
                $scope.errMessage = response.data.message;
            }
        });
    };
});


//my Account controller
app.controller('myGameCtr', function (RestService, $scope, $window, $http, $location, $interval) {
    console.log("myGame controller");
    //Set active class
    $scope.selected = "leaderboard";

    //Set leader board view
    $scope.MyTeamDisplay = false;
    $scope.DraftTeamDisplay = false;
    $scope.LeaderBoarDisplay = true;
    $scope.PointHistoryDisplay = false;
    $scope.GainPointDisplay = false;
    $scope.errMessageDisplay = false;
    //Get the timer
    $interval(function () {
        RestService.getTimer().then(function successCallback(response) {
            $scope.theTime = response.data.Time;
            $scope.Round = response.data.round;
        });
    }, 1000);
    //Pagination
    $scope.currentPage = 0;
    $scope.pageSize = 10;

    //Global Variable
    $scope.teams = Teams;
    $scope.playerSelected = [];
    //Check Quiz atempt
    RestService.GetCheckQuizAtempt($window.localStorage.getItem("id")).then(function successCallback(response) {
        if (response.data.Atempt == true)
            $scope.GainPointAtempt = "Attempt";
        else
            $scope.GainPointAtempt = "";
    });
    //Get the view ranking
    RestService.GetRanking($window.localStorage.getItem("id")).then(function successCallback(response) {
        $scope.MyRanking = response.data.result;
        //console.log("view my rank" + $scope.MyRanking);
    });
    //Get the view my Point
    RestService.GetMyPoint($window.localStorage.getItem("id")).then(function successCallback(response) {
        $scope.point = response.data.point;
        console.log("Point " + $scope.point);
        $scope.teamName = response.data.teamName;
        console.log(response.data.money);
        $scope.money = response.data.money;
    });
    //Get the Leader board
    RestService.GetLeaderBoard().then(function successCallback(response) {
        $scope.ResultLeaderboard = response.data.result;
        $scope.numberOfPages = function () {
            return Math.ceil($scope.ResultLeaderboard.length / $scope.pageSize);
        }
    });
    //Refresh the leader board
    $scope.RefeshResult = function(){
        RestService.GetLeaderBoard().then(function successCallback(response) {
            $scope.ResultLeaderboard = response.data.result;
            console.log( $scope.ResultLeaderboard);
            $scope.numberOfPages = function () {
                return Math.ceil($scope.ResultLeaderboard.length / $scope.pageSize);
            }
        });
    }
    //Point History Display
    $scope.MyPointHistory = function () {
        $scope.selected = "MyPointHistory";
        $scope.errMessageDisplay = false;
        $scope.GainPointDisplay = false;
        $scope.MyTeamDisplay = false;
        $scope.DraftTeamDisplay = false;
        $scope.LeaderBoarDisplay = false;
        $scope.PointHistoryDisplay = true;

        RestService.GetMyPointHistory($window.localStorage.getItem("id")).then(function successCallback(response) {
            //console.log("View My History" + response.data.collections);
            $scope.ResultPointHistory = response.data.collections;
        });
    }
    //leaderboard Display
    $scope.leaderboard = function () {
        $scope.selected = "leaderboard";

        $scope.errMessageDisplay = false;
        $scope.data = [];
        $scope.MyTeamDisplay = false;
        $scope.GainPointDisplay = false;
        $scope.DraftTeamDisplay = false;
        $scope.LeaderBoarDisplay = true;
        $scope.PointHistoryDisplay = false;

        RestService.GetLeaderBoard().then(function successCallback(response) {
            $scope.ResultLeaderboard = response.data.result;
            $scope.numberOfPages = function () {
                return Math.ceil($scope.ResultLeaderboard.length / $scope.pageSize);
            }
        });
    };
    //Choose the team Draft
    $scope.DraftTeam = function () {
        $scope.selected = "DraftTeam";

        $scope.errMessageDisplay = false;
        $scope.MyTeamDisplay = false;
        $scope.DraftTeamDisplay = true;
        $scope.LeaderBoarDisplay = false;
        $scope.PointHistoryDisplay = false;
        $scope.GainPointDisplay = false;

        RestService.GetPlayerPool().then(function successCallback(response) {
            //Assign player pools.
            $scope.playerPools = response.data.collections;
            console.log($scope.playerPools);
            $scope.numberOfPages = function () {
                return Math.ceil($scope.playerPools.length / $scope.pageSize);
            }
        });
        //Get player selected
        // RestService.GetMyTeam($window.localStorage.getItem("id")).then(function successCallback(response) {
        //     $scope.playerSelected = response.data.collections;
        //     //console.log(response.data.collections);
        //     //Show the number of player pools and selected with the same number of players
        //     for (var i = 0; i < $scope.playerPools.length; i++) {
        //         for (var j = 0; j < $scope.playerSelected.length; j++) {
        //             if ($scope.playerPools[i]._id == $scope.playerSelected[j]._id) {
        //                 //Remove from player pool
        //                 $scope.playerPools.splice(i, 1);
        //             }
        //         }
        //     }
        // });

    }
    function ViewMyTeam() {
        $scope.selected = "ViewMyTeam";
        $scope.errMessageDisplay = false;
        $scope.MyTeamDisplay = true;
        $scope.DraftTeamDisplay = false;
        $scope.LeaderBoarDisplay = false;
        $scope.PointHistoryDisplay = false;
        $scope.GainPointDisplay = false;
        //console.log("ViewMyTeam");

        RestService.GetMyTeam($window.localStorage.getItem("id")).then(function successCallback(response) {
            $scope.viewTeam = response.data.collections;
            console.log($scope.viewTeam);
        });
    }
    //View team display
    $scope.ViewMyTeam = function () {
        console.log("View my team");
        ViewMyTeam();
    }
    //Draft player section
    $scope.SelectPlayerFromPools = function (id) {
        // Remove element on the left hand side when the user select the player.
        for (var i = 0; i < $scope.playerPools.length; i++) {
            if ($scope.playerPools[i]._id == id) {
                //Add to player select
                $scope.playerSelected.push($scope.playerPools[i]);
                //Remove from player pool
                $scope.playerPools.splice(i, 1);
            }
        }
    }
    $scope.ReturnPlayerFromTheSelectedTeam = function (id, image, playerName) {
        // Remove element on the left hand side when the user select the player.
        for (var i = 0; i < $scope.playerSelected.length; i++) {
            if ($scope.playerSelected[i]._id == id) {
                //Add to player select
                $scope.playerPools.push($scope.playerSelected[i]);
                //Remove from player pool
                $scope.playerSelected.splice(i, 1);
            }
        }
    }
    $scope.SaveTeamSelected = function () {
        $scope.errMessageDisplay = false;
        console.log("Save team");
        console.log($scope.teamName);
        if ($scope.playerSelected.length < 5) {
            console.log($scope.errMessage);
            $scope.errMessageDisplay = true;
            $scope.errMessage = "Please select your team, your team at least 6 players";
        }
        else if ($scope.teamName === undefined || $scope.teamName === null) {
            $scope.errMessageDisplay = true;
            $scope.errMessage = "Please type your team name";
        }
        else {
            console.log("Add to my collection clicked");
            console.log($scope.playerSelected);

            //Request the back-end to save it to the database.
            RestService.AddToMyTeam($window.localStorage.getItem("id"), $scope.teamName, $scope.playerSelected).then(function successCallback(response) {
                if (response.data.success) {
                    $scope.selected = "ViewMyTeam";
                    $scope.errMessageDisplay = false;
                    $scope.MyTeamDisplay = true;
                    $scope.DraftTeamDisplay = false;
                    $scope.LeaderBoarDisplay = false;
                    $scope.PointHistoryDisplay = false;
                    $scope.GainPointDisplay = false;
                    //console.log("ViewMyTeam");
                    RestService.GetMyPoint($window.localStorage.getItem("id")).then(function successCallback(response) {
                        $scope.point = response.data.point;
                        $scope.teamName = response.data.teamName;
                        console.log(response.data.money);
                        $scope.money = response.data.money;
                    });
                    RestService.GetMyTeam($window.localStorage.getItem("id")).then(function successCallback(response) {
                        $scope.viewTeam = response.data.collections;
                        console.log($scope.viewTeam);
                    });
                }
                else {
                    console.log(response);
                    $scope.errMessageDisplay = true;
                    $scope.errMessage = response.data.message;

                }
            });
        }
    }
    // End Draft player section
    $scope.GainPoint = function () {
        //Check Quiz atempt
        RestService.GetCheckQuizAtempt($window.localStorage.getItem("id")).then(function successCallback(response) {
            if (response.data.Atempt == true) {
                $scope.GainPointAtempt = "Attempt";
                $scope.WatchAndGetPoint = false;
                $scope.TextQuizAttempt = "You already attempt the quiz, you can earn points in the next round"
            }
            else {
                $scope.GainPointAtempt = "";
                $scope.WatchAndGetPoint = true;
            }
        });



        $scope.selected = "GainPoint";
        $scope.GainPointDisplay = true;
        $scope.errMessageDisplay = false;
        $scope.MyTeamDisplay = false;
        $scope.DraftTeamDisplay = false;
        $scope.LeaderBoarDisplay = false;
        $scope.PointHistoryDisplay = false;

        console.log("Gain Point Controller");
        $scope.question = Question1;
        $scope.SubmitQuiz = function () {
            $scope.errshow = false;
            $scope.gainPointshow = false;
            console.log($scope.FirstQuestion);
            console.log($scope.SecondQuestion);
            if ($scope.FirstQuestion === undefined || $scope.FirstQuestion === null) {
                $scope.err = "Please answer the first question";
                $scope.errshow = true;
                console.log("fist");
            }
            else if ($scope.SecondQuestion === undefined || $scope.SecondQuestion === null) {
                $scope.err = "Please answer the second question";
                $scope.errshow = true;
                console.log("sec");
            }
            else {
                $http({
                    method: "post",
                    url: "/CheckQuiz",
                    data: { "id": $window.localStorage.getItem("id"), "FirstQuestion": $scope.FirstQuestion, "SecondQuestion": $scope.SecondQuestion }
                }).then(function mySuccess(response) {
                    if (response.data.success) {

                        //console.log(response.data.point)
                        $scope.gainPoint = response.data.point;
                        RestService.GetMyPoint($window.localStorage.getItem("id")).then(function successCallback(response) {
                            $scope.point = response.data.point;
                            $scope.teamName = response.data.teamName;
                            console.log(response.data.money);
                            $scope.money = response.data.money;
                        });
                        $scope.GainPointAtempt = "Attempt";
                        $scope.WatchAndGetPoint = false;
                        var point = response.data.point > 0 ? " points" : " point";
                        $scope.TextQuizAttempt = "You get " + response.data.point + point;

                    }
                    else {

                    }

                });

            }


        }

    }
    //Search draft team according to the team name
    $scope.SearchTeam = function () {
        console.log("Search" + $scope.Search);
        var array = [];
        RestService.GetPlayerPool().then(function successCallback(response) {
            response.data.collections.forEach(element => {
                if (element.TeamName == $scope.Search) {
                    //console.log("element " + element.TeamName + "name " + element.playerName);
                    array.push(element);
                }
            });
            $scope.playerPools = array;
        });
        //Get player selected
        // RestService.GetMyTeam($window.localStorage.getItem("id")).then(function successCallback(response) {
        //     $scope.playerSelected = response.data.collections;
        //     //console.log(response.data.collections);
        //     //Show the number of player pools and selected with the same number of players
        //     for (var i = 0; i < $scope.playerPools.length; i++) {
        //         for (var j = 0; j < $scope.playerSelected.length; j++) {
        //             if ($scope.playerPools[i]._id == $scope.playerSelected[j]._id) {
        //                 //Remove from player pool
        //                 $scope.playerPools.splice(i, 1);
        //             }
        //         }
        //     }
        // });
    };
    //Search draft team according to the player name
    $scope.SearchPlayerName = function () {
        //console.log("PlayerName " + $scope.PlayerName);
        var array = [];
        RestService.GetPlayerPool().then(function successCallback(response) {
            response.data.collections.forEach(element => {
                if (element.playerName == $scope.PlayerName) {
                    //console.log("name " + element.TeamName);
                    array.push(element);
                }
            });
            $scope.playerPools = array;
            $scope.PlayerName = "";
        });
    };
    $scope.ViewModel = function (playerToSubstituteId) {
        console.log("ModelViewPlayerPool ID" + playerToSubstituteId);
        $scope.PlayerToSubstituteId = playerToSubstituteId;
        RestService.GetPlayerPool().then(function successCallback(response) {
            //Assign player pools.
            $scope.playerPools = response.data.collections;
            console.log($scope.playerPools);
            $scope.numberOfPages = function () {
                return Math.ceil($scope.playerPools.length / $scope.pageSize);
            }
        });

        // Get player selected
        RestService.GetMyTeam($window.localStorage.getItem("id")).then(function successCallback(response) {
            $scope.playerSelected = response.data.collections;
            //console.log(response.data.collections);
            //Show the number of player pools and selected with the same number of players
            for (var i = 0; i < $scope.playerPools.length; i++) {
                for (var j = 0; j < $scope.playerSelected.length; j++) {
                    if ($scope.playerPools[i]._id == $scope.playerSelected[j]._id) {
                        //Remove from player pool
                        $scope.playerPools.splice(i, 1);

                    }
                    // console.log($scope.playerSelected);
                }
            }
        });

    }
    $scope.ModelSelectedPlayerToSubstitute = function (playerSelectedID, index) {
        $scope.selected = index;

        $scope.PlayerSelectedID = playerSelectedID;


        console.log("PlayerSelectedID" + $scope.PlayerSelectedID);
    }
    $scope.SubstituteSave = function () {

        // Get player selected
        RestService.GetMyTeam($window.localStorage.getItem("id")).then(function successCallback(response) {
            $scope.playerSelected = response.data.collections;
            console.log(response.data.collections);

            for (var j = 0; j < $scope.playerSelected.length; j++) {
                if ($scope.PlayerToSubstituteId == $scope.playerSelected[j]._id) {
                    //Remove from player pool
                    $scope.playerSelected.splice(j, 1);
                    $scope.playerSelected.push($scope.PlayerSelectedID);
                    console.log($scope.playerSelected);
                    RestService.AddToMyTeam($window.localStorage.getItem("id"), $scope.teamName, $scope.playerSelected).then(function successCallback(response) {
                        if (response.data.success)
                            ViewMyTeam();
                        else {
                            console.log(response);
                            $scope.errMessageDisplay = true;
                            $scope.errMessage = response.data.message;
                        }
                    });
                }
                // console.log($scope.playerSelected);
            }
        });

    }

});

app.controller('AFLTimerController', function (RestService, $scope, $interval, $http, $window) {
    //RestService.getTimer()

    $interval(function () {
        RestService.getTimer().then(function successCallback(response) {
            //console.log(response);
            $scope.theTime = response.data.Time;
            $scope.Round = response.data.round;
        });
    }, 1000);
});


app.controller('PlayerStaticController', function ($scope, $http, $location, $window) {

    console.log("PlayerStaticController");

    $scope.currentPage = 0;
    $scope.pageSize = 15;
    $http({
        method: "post",
        url: "/PlayerStatic"
    }).then(function mySuccess(response) {
        if (response.data.success) {
            var res = response.data.result;
            $scope.round = response.data.round;
            console.log(res);
            $scope.Header = res[0];
            //console.log("Header " + res[0]);
            var AddPoint = [];
            res.forEach(element => {
                // if (element[4] == $window.localStorage.getItem("index")) {

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

                var data = [{ Point: value }];
                data.push(element);
                AddPoint.push(data);
                //}
            });
            console.log(AddPoint);

            $scope.PlayerStatic = AddPoint;
            //console.log(res);
            $scope.numberOfPages = function () {
                return Math.ceil($scope.PlayerStatic.length / $scope.pageSize);
            }
            //console.log("Team" + res);
        }
        else {
            console.log(response.data);
        }
    });
});

//App configuration
app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when("/Home", {
            templateUrl: "app/views/page/home.html"
        })
        .when("/", {
            templateUrl: "app/views/page/home.html"
        })
        .when("/register", {
            templateUrl: "app/views/page/register.html",
            controller: 'registerController'
        })
        .when("/login", {
            templateUrl: "app/views/page/login.html",
            controller: 'loginController'
        })
        .when("/PlayerStatic", {
            templateUrl: "app/views/page/PlayerStatic.html",
            controller: 'PlayerStaticController'
        })
        .when("/AFLTimer", {
            templateUrl: "app/views/page/AFLTimer.html",
            controller: 'AFLTimerController'
        })

        .when("/myGame", {
            templateUrl: "app/views/page/myGame.html",
            controller: 'myGameCtr'
        })
        .when("/about", {
            templateUrl: "app/views/page/about.html",

        })
        .otherwise({ redirectTo: "/" });
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
});
