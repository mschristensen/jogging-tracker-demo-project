'use strict';

var app = angular.module('app');
app.controller('authController', ['$scope', '$state', function($scope, $state) {
  $scope.isLoginForm = function() {
    return $state.current.name === 'auth.login';
  };
}]);
