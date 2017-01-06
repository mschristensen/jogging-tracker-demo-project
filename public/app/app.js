"use strict";

var app = angular.module('myApp', ['ui.router']);

// configure the router
app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  // remove trailing slashes from URL
  $urlRouterProvider.rule(function($injector, $location) {
    var path = $location.path();
    var hasTrailingSlash = path[path.length-1] === '/';
    if(hasTrailingSlash) {
      //if last charcter is a slash, return the same url without the slash
      var newPath = path.substr(0, path.length - 1);
      return newPath;
    }
  });
}]);

app.run(['$rootScope', '$state', function($rootScope, $state) {
}]);

app.controller('rootController', ['$scope', '$state', function($scope, $state) {
  $scope.app_test = "APP WORKING";
}]);
