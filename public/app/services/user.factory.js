'use strict';

var app = angular.module('app');
app.factory('UserFactory', ['ApiFactory', function(ApiFactory) {
  let userFactory = {};

  userFactory.getUsers = function() {
    return new Promise(function(resolve, reject) {
      ApiFactory.request('GET', '/user').then(function(response) {
        return resolve(response.payload);
      }, reject);
    });
  };

  userFactory.updateUser = function(user) {
    if(user.name) user.name = JSON.stringify(user.name);
    return new Promise(function(resolve, reject) {
      ApiFactory.request('PUT', '/user/' + user._id, user).then(function(response) {
        return resolve(response.payload);
      }, reject);
    });
  };

  userFactory.deleteUser = function(id) {
    return new Promise(function(resolve, reject) {
      ApiFactory.request('DELETE', '/user/' + id).then(function(response) {
        return resolve();
      }, reject);
    });
  };

  return userFactory;
}]);
