'use strict';

var app = angular.module('app');
app.controller('authController', ['$scope', '$rootScope', '$state', 'AuthFactory', 'AUTH_EVENTS', 'HTTP_RESPONSES', '$timeout', function($scope, $rootScope, $state, AuthFactory, AUTH_EVENTS, HTTP_RESPONSES, $timeout) {
  $scope.errorMessage = '';
  $scope.getErrorMessage = function() {
    return $scope.errorMessage;
  };

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
      $state.go('home.jogs');
    }, function(response) {
      $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
      $timeout(() => {
        switch(response.status) {
          case HTTP_RESPONSES.NotFound:
            $scope.errorMessage = 'Oops! That user doesn\'t exist.';
            break;
          case HTTP_RESPONSES.BadRequest:
            if(response.payload.InvalidArguments) {
              $scope.errorMessage = 'Some fields were invalid!';
              console.error('Invalid arguments:', response.payload.InvalidArguments);
            } else if(response.payload.message === 'user already exists') {
              $scope.errorMessage = 'An account already exists for that email.';
            } else {
              $scope.errorMessage = 'Something went wrong. This is embarassing.';
            }
            break;
          case HTTP_RESPONSES.Forbidden:
            $scope.errorMessage = 'Hmmm. Wrong password.';
            break;
          case HTTP_RESPONSES.InternalServerError:
            $scope.errorMessage = 'Something went wrong. This is embarassing.';
            break;
          default:
            // TODO: handle unknown status code
            break;
        }
      });
    });
  };

  $scope.signup = function(credentials) {
    AuthFactory.signup(credentials).then(function() {
      $rootScope.$broadcast(AUTH_EVENTS.signupSuccess);
      $state.go('home.jogs');
    }, function(response) {
      $rootScope.$broadcast(AUTH_EVENTS.signupFailed);
      $timeout(() => {
        switch(response.status) {
          case HTTP_RESPONSES.NotFound:
            $scope.errorMessage = 'Oops! That user doesn\'t exist.';
            break;
          case HTTP_RESPONSES.BadRequest:
            if(response.payload.InvalidArguments) {
              $scope.errorMessage = 'Some fields were invalid!';
              console.error('Invalid arguments:', response.payload.InvalidArguments);
            } else if(response.payload.message === 'user already exists') {
              $scope.errorMessage = 'An account already exists for that email.';
            } else {
              $scope.errorMessage = 'Something went wrong. This is embarassing.';
            }
            break;
          case HTTP_RESPONSES.Forbidden:
            $scope.errorMessage = 'Hmmm. Wrong password.';
            break;
          case HTTP_RESPONSES.InternalServerError:
            $scope.errorMessage = 'Something went wrong. This is embarassing.';
            break;
          default:
            // TODO: handle unknown status code
            break;
        }
      });
    });
  };
}]);
