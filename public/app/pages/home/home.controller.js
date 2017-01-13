'use strict';

var app = angular.module('app');
app.controller('homeController', ['$scope', '$state', function($scope, $state) {
  $scope.navOpen = false;

  $scope.isNavOpen = function() {
    return $scope.navOpen;
  };

  $scope.toggleNavOpen = function() {
    $scope.navOpen = !$scope.navOpen;
  };

  $scope.getState = function() {
    return $state.current.name;
  };
}]);
