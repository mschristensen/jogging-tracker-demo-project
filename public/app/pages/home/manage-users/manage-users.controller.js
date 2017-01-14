'use strict';

var app = angular.module('app');
app.controller('manageUsersController', ['$scope', 'UserFactory', 'HTTP_RESPONSES', '$timeout', '$mdToast', 'AuthFactory', 'USER_ROLES', function($scope, UserFactory, HTTP_RESPONSES, $timeout, $mdToast, AuthFactory, USER_ROLES) {
  $scope.users = [];
  $scope.getUsers = function() {
    return $scope.users;
  };

  $scope.USER_ROLES = USER_ROLES;
  $scope.getRoleName = function(value) {
    for(let key in USER_ROLES) {
      if(USER_ROLES.hasOwnProperty(key)) {
        if(USER_ROLES[key] === value) return key;
      }
    }
    return '';
  };

  $scope.editingId = '';
  $scope.editEntry = function(entryId, parameter) {
    $scope.editingId = entryId + parameter;
  };
  $scope.stopEditing = function() {
    $scope.editingId = '';
  };

  $scope.deleteUser = function(user) {
    UserFactory.deleteUser(user._id).then(function() {
      showToast('Woohoo! The user was deleted.');
      // update users
      $scope.fetchUsers();
    }, function(response) {
      switch(response.status) {
        case HTTP_RESPONSES.Forbidden:
          AuthFactory.logout();
          break;
        case HTTP_RESPONSES.NotFound:
        case HTTP_RESPONSES.BadRequest:
        case HTTP_RESPONSES.InternalServerError:
          showToast('Something went wrong there. This is embarassing.');
          console.error('Response:', response);
          break;
        default:
          console.error('Unknown status code in response:', response);
          break;
      }
    });
  };

  $scope.updateUser = function(user) {
    console.log(user.role, typeof user.role);
    UserFactory.updateUser(user).then(function() {
      showToast('Woohoo! The user was updated.');
      // update users
      $scope.fetchUsers();
    }, function(response) {
      switch(response.status) {
        case HTTP_RESPONSES.BadRequest:
          if(response.payload.InvalidArguments && response.payload.InvalidArguments.length > 0) {
            showToast('Invalid ' + response.payload.InvalidArguments[0] + ' parameter!');
          } else {
            showToast('Some of the parameters you provided are invalid.');
          }
          break;
        case HTTP_RESPONSES.Forbidden:
          AuthFactory.logout();
          break;
        case HTTP_RESPONSES.InternalServerError:
          showToast('Something went wrong there. This is embarassing.');
          console.error('Response:', response);
          break;
        default:
          console.error('Unknown status code in response:', response);
          break;
      }
    });
  };

  $scope.fetchUsers = function() {
    UserFactory.getUsers().then(function(users) {
      $timeout(function() {
        $scope.users = users || [];
      });
    }, function(response) {
      switch(response.status) {
        case HTTP_RESPONSES.NotFound:
          $timeout(function() {
            $scope.users = [];
          });
          break;
        case HTTP_RESPONSES.Forbidden:
          AuthFactory.logout();
          break;
        case HTTP_RESPONSES.BadRequest:
        case HTTP_RESPONSES.InternalServerError:
          showToast('Something went wrong there. This is embarassing.');
          console.error('Response:', response);
          break;
        default:
          console.error('Unknown status code in response:', response);
          break;
      }
    });
  };

  function showToast(msg) {
    $mdToast.show(
      $mdToast.simple()
        .textContent(msg)
        .position('top right')
        .action('ok')
        .hideDelay(5000)
    );
  }

  $scope.fetchUsers();
}]);
