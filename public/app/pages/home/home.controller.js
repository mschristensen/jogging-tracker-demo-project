'use strict';

var app = angular.module('app');
app.controller('homeController', ['$scope', '$state', 'AuthFactory', 'USER_ROLES', function($scope, $state, AuthFactory, USER_ROLES) {
  $scope.navOpen = true;

  $scope.isNavOpen = function() {
    return $scope.navOpen;
  };

  $scope.toggleNavOpen = function() {
    $scope.navOpen = !$scope.navOpen;
  };

  $scope.getState = function() {
    return $state.current.name;
  };

  $scope.getPageTitle = function() {
    switch($state.current.name) {
      case 'home.jogs':
        return 'My Jogs';
      case 'home.reports':
        return 'Reports';
      case 'home.manage-users':
        return 'Manage Users';
      default:
        return '';
    }
  };

  $scope.showMenuItem = function(stateName) {
    let state = $state.get(stateName);
    return AuthFactory.isAuthorized(state.data.authorizedRoles);
  };

  $scope.getUser = function() {
    return AuthFactory.getUser();
  };

  $scope.logout = function() {
    AuthFactory.logout();
  };
}]);
