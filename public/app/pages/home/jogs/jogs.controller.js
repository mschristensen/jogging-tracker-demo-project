'use strict';

var app = angular.module('app');
app.controller('jogsController', ['$scope', 'JogFactory', 'HTTP_RESPONSES', function($scope, JogFactory, HTTP_RESPONSES) {
  let oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  $scope.date = {
    from: oneWeekAgo,
    to: new Date()
  };

  JogFactory.getJogs().then(function(jogs) {
    console.log("JOGS:", jogs);
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
