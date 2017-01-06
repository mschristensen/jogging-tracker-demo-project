'use strict';
var app = angular.module('myApp');
app.controller('testController', ['$scope', function($scope) {
  $scope.component_test = "COMPONENT WORKING";
}]);
