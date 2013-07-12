var angular, io;
var scope, socket;

function reloadPage() {
    if (scope && socket) {
        socket.emit('getData', function(data) {
            console.log(data);
            scope.krowdf = data;
            scope.$apply();
        });
    }
    setTimeout(reloadPage, 7500);
}

function initPage() {
    scope.krowdf = {
        goal: {
            current: 0,
            total: 0
        },
        bakers: []
    };
}

function KrowdfCtrl($scope) {
    scope = $scope;
    initPage();
    reloadPage();
}

function pledge() {
    var infos = {
        name: scope.name,
        email: scope.email
    };

    socket.emit('pledge', infos, function(err, res) {
        console.log(err || res.validateUrl);

        scope.name = "";
        scope.email = "";
        scope.$apply();
    });
}

require([
    'https://ajax.googleapis.com/ajax/libs/angularjs/1.0.7/angular.min.js',
    'socket.io/socket.io'
], function() {
    angular = window.angular;
    io = window.io;

    console.log('Loading socket.io...');
    socket = io.connect();

    console.log('Loading AngularJS...');
    angular.bootstrap(document);

    console.log('Done.');
});
