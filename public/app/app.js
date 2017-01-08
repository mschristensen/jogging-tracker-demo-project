"use strict";

var app = angular.module('myApp', ['ui.router']);

// configure the router
app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
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
}]);

app.run(['$rootScope', '$state', function($rootScope, $state) {
}]);

app.controller('rootController', ['$scope', '$state', function($scope, $state) {
  $scope.app_test = "APP WORKING";
}]);
