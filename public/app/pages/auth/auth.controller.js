'use strict';

var app = angular.module('app');
app.controller('authController', ['$scope', '$rootScope', '$state', 'AuthFactory', 'AUTH_EVENTS', function($scope, $rootScope, $state, AuthFactory, AUTH_EVENTS) {
  $scope.credentials = {
    name: {
      first: '',
      last: ''
    },
    email: '',
    password: ''
  };

  $scope.isLoginForm = function() {
    return $state.current.name === 'auth.login';
  };

  $scope.login = function(credentials) {
    AuthFactory.login(credentials).then(function() {
      $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
    }, function(response) {
      $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
    });
  };
}]);
