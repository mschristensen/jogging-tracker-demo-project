"use strict";

var app = angular.module('app', ['ui.router', 'angular-cache']);

app.constant('API_URL', 'http://localhost:3000/api');

app.constant('HTTP_RESPONSES', {
  NoResponse: -1,
  OK: 200,
  Created: 201,
  MovedPermanently: 301,
  BadRequest: 400,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  UnsupportedMediaType: 415,
  TooManyRequests: 429,
  InternalServerError: 500,
  NotImplemented: 501,
  ServiceUnavailable: 503
});

app.constant('USER_ROLES', {
  User: 1,
  UserManager: 2,
  Admin: 3
});

app.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
});

// configure the router
app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/');

  // remove trailing slashes from URL
  $urlRouterProvider.rule(($injector, $location) => {
    let path = $location.path();
    let hasTrailingSlash = path[path.length-1] === '/';
    if(hasTrailingSlash) {
      //if last charcter is a slash, return the same url without the slash
      let newPath = path.substr(0, path.length - 1);
      return newPath;
    }
  });

  $stateProvider
    // Log In/Sign Up state
    .state('auth', {
      abstract: true,
      templateUrl: '/app/pages/auth/auth.view.html',
      controller: 'authController'
    })
    .state('auth.login', {
      url: '/login'
    })
    .state('auth.signup', {
      url: '/signup'
    });
}]);

app.run(['$rootScope', '$state', function($rootScope, $state) {
}]);

app.controller('rootController', ['$scope', '$state', function($scope, $state) {
  $scope.app_test = "APP WORKING";
}]);
