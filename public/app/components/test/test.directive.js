'use strict';
var app = angular.module('myApp');
app.directive('testDirective', function() {
  return {
    restrict: 'E',
    templateUrl: '/app/components/test/test.view.html',
    controller: 'testController'
  };
});
