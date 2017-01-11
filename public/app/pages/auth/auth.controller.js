'use strict';

var app = angular.module('app');
app.controller('authController', ['$scope', '$state', function($scope, $state) {
  $scope.test = $state.current.name;
}]);
