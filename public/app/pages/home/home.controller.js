'use strict';

var app = angular.module('app');
app.controller('homeController', ['$scope', function($scope) {
  $scope.navOpen = false;

  $scope.isNavOpen = function() {
    return $scope.navOpen;
  };

  $scope.toggleNavOpen = function() {
    $scope.navOpen = !$scope.navOpen;
  };
}]);
