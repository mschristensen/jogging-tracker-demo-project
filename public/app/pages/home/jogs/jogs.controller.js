'use strict';

var app = angular.module('app');
app.controller('jogsController', ['$scope', 'JogFactory', 'HTTP_RESPONSES', '$timeout', function($scope, JogFactory, HTTP_RESPONSES, $timeout) {
  let oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  $scope.date = {
    from: oneWeekAgo,
    to: new Date()
  };

  $scope.jogs = [];
  $scope.getJogs = function() {
    return $scope.jogs;
  };

  $scope.newJog = {
    date: new Date(),
    distance: 0,
    time: 0
  };

  $scope.computeAverageSpeed = function(jog) {
    let speed = jog.distance / jog.time;
    if(isNaN(speed)) return '...';
    return speed.toFixed(2);
  };

  JogFactory.getJogs().then(function(jogs) {
    $timeout(function() {
      $scope.jogs = jogs;
    });
  }, function(response) {
    switch(response.status) {
      case HTTP_RESPONSES.NotFound:
        break;
      case HTTP_RESPONSES.BadRequest:
        break;
      case HTTP_RESPONSES.Forbidden:
        break;
      case HTTP_RESPONSES.InternalServerError:
        break;
      default:
        // TODO: handle unknown status code
        break;
    }
  });
}]);
