"use strict";

var app = angular.module('app', ['ui.router', 'angular-cache', 'ngMaterial']);

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
  signupSuccess: 'auth-signup-success',
  signupFailed: 'auth-signup-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
});

// configure the router
app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'USER_ROLES', '$compileProvider', '$mdDateLocaleProvider', function($stateProvider, $urlRouterProvider, $locationProvider, USER_ROLES, $compileProvider, $mdDateLocaleProvider) {
  // Prevent Angular 1.6 optimisations which break some Angular Material components
  $compileProvider.preAssignBindingsEnabled(true);

  $mdDateLocaleProvider.formatDate = function(date) {
    let day = date.getDate();
    let monthIndex = date.getMonth();
    let year = date.getFullYear();
    return day + '/' + (monthIndex + 1) + '/' + year;
  };

  $mdDateLocaleProvider.parseDate = function(dateString) {
    let parts = dateString.split('/');
    if(parts.length !== 3) return new Date(NaN);
    try {
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    } catch(err) {
      return new Date(NaN);
    }
  };

  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/jogs');

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
    })
    .state('home', {
      abstract: true,
      templateUrl: '/app/pages/home/home.view.html',
      controller: 'homeController'
    })
    .state('home.jogs', {
      url: '/jogs',
      templateUrl: '/app/pages/home/jogs/jogs.view.html',
      controller: 'jogsController',
      data: {
        authorizedRoles: [USER_ROLES.User, USER_ROLES.UserManager, USER_ROLES.Admin]
      }
    })
    .state('home.reports', {
      url: '/reports',
      data: {
        authorizedRoles: [USER_ROLES.User, USER_ROLES.UserManager, USER_ROLES.Admin]
      }
    })
    .state('home.manage-users', {
      url: '/manage-users',
      data: {
        authorizedRoles: [USER_ROLES.UserManager, USER_ROLES.Admin]
      }
    });
}]);

app.run(['$rootScope', '$state', 'AuthFactory', 'AUTH_EVENTS', function($rootScope, $state, AuthFactory, AUTH_EVENTS) {
  $rootScope.$on('$stateChangeStart', function(event, next) {
    if(next.data && next.data.authorizedRoles) {
      if(!AuthFactory.isAuthorized(next.data.authorizedRoles)) {
        event.preventDefault();
        if(AuthFactory.isAuthenticated()) {
          // user is not allowed
          $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
        } else {
          // user is not logged in
          $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
        }
      }
    }
  });

  $rootScope.$on(AUTH_EVENTS.notAuthenticated, function() {
    $state.go('auth.login');
  });
}]);

app.controller('rootController', ['$scope', '$state', function($scope, $state) {
  $scope.app_test = "APP WORKING";
}]);
