"use strict";

var app = angular.module('app', ['ui.router', 'angular-cache', 'ngMaterial', 'angularMoment']);

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
app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'USER_ROLES', '$compileProvider', '$mdDateLocaleProvider', '$mdThemingProvider', 'moment', '$httpProvider', function($stateProvider, $urlRouterProvider, $locationProvider, USER_ROLES, $compileProvider, $mdDateLocaleProvider, $mdThemingProvider, moment, $httpProvider) {
  
  function convertDateStringsToDates(input) {
    // Ignore things that aren't objects.
    if (typeof input !== 'object') return input;

    for(let key in input) {
      // don't check properties further along the prototype chain
      if(!input.hasOwnProperty(key)) continue;

      let value = input[key];
      let match;
      // Check for string properties which look like dates
      if(typeof value === 'string' && Object.prototype.toString.call(new Date(value)) === '[object Date]' && !isNaN(new Date(value).getTime())) {
        // Successfully instantiated a *valid* Date object using string value
        input[key] = new Date(value);
      } else if(typeof value === 'object') {
        // Recurse into object
        convertDateStringsToDates(value);
      }
    }
  }

  // CONVERT DATE STRINGS ON RESPONSES TO ACTUAL DATES
  $httpProvider.defaults.transformResponse.push(function(responseData) {
    convertDateStringsToDates(responseData);
    return responseData;
  });

  // MATERIAL UI CONFIG
  // Prevent Angular 1.6 optimisations which break some Angular Material components
  $compileProvider.preAssignBindingsEnabled(true);

  // Default date format dd/mm/yyyy
  $mdDateLocaleProvider.formatDate = function(date) {
    return date ? moment(date).format('DD/MM/YYYY') : '';
  };

  // Parse date of format dd/mm/yyyy
  $mdDateLocaleProvider.parseDate = function(dateString) {
    var m = moment(dateString, 'DD/MM/YYYY', true);
    return m.isValid() ? m.toDate() : new Date(NaN);
  };

  // Custom primary colour theme
  $mdThemingProvider.definePalette('customPalette', {
    '50': 'e4e7ea',
    '100': 'c0c6cd',
    '200': '9aa4af',
    '300': '707f8e',
    '400': '526476',
    '500': '34495e',
    '600': '2f4255',
    '700': '2a3b4c',
    '800': '243342',
    '900': '1b2631',
    'A100': 'C5CAE9',
    'A200': '9FA8DA',
    'A400': '7986CB',
    'A700': '5C6BC0',
    'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
                                        // on this palette should be dark or light

    'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
     '200', '300', '400', 'A100'],
    'contrastLightColors': undefined    // could also specify this if default was 'dark'
  });

  // Custom accent colour based on the MaterialUI 'green' theme
  var customAccentMap = $mdThemingProvider.extendPalette('green', {
    '500': '#2ecc71',
    'contrastDefaultColor': 'light'
  });

  // Register the new color palette map with the name <code>neonRed</code>
  $mdThemingProvider.definePalette('customAccent', customAccentMap);

  // Use that theme for the primary intentions
  $mdThemingProvider.theme('default')
    .primaryPalette('customPalette')
    .accentPalette('customAccent', {
      'default': '500'
    });

  // ROUTING
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
