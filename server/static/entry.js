var angular, io;
var scope, socket;

function reloadPage() {
    if (scope && socket) {
        socket.emit('getData', function(data) {
            // console.log(data);
            scope.krowdf.data = data;
            scope.$apply();
        });
    }
    setTimeout(reloadPage, 7500);
}

function pledge() {
    var infos = {
        name: scope.name,
        email: scope.email
    };

    socket.emit('pledge', infos, function(res) {
        scope.krowdf.paypalURL = res.url;

        scope.name = "";
        scope.email = "";
        scope.$apply();
    });
}

function initPage() {
    scope.krowdf = {
        data: {
            goal: {
                current: 0,
                total: 0
            },
            bakers: []
        },
        paypalURL: null
    };
    scope.pledge = pledge;

    scope.name = '';
    scope.email = '';
}

function KrowdfCtrl($scope) {
    scope = $scope;
    initPage();
    reloadPage();
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
