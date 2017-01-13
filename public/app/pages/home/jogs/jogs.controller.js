'use strict';

var app = angular.module('app');
app.controller('jogsController', ['$scope', function($scope) {
  let oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  $scope.date = {
    from: oneWeekAgo,
    to: new Date()
  };
}]);
