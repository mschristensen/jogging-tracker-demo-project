'use strict';

var app = angular.module('app');
app.factory('JogFactory', ['ApiFactory', function(ApiFactory) {
  let jogFactory = {};

  jogFactory.getJogs = function() {
    return new Promise(function(resolve, reject) {
      ApiFactory.request('GET', '/jog').then(function(response) {
        return resolve(response.payload);
      }, reject);
    });
  };

  jogFactory.createJog = function(jog) {
    return new Promise(function(resolve, reject) {
      ApiFactory.request('POST', '/jog', jog).then(function(response) {
        return resolve(response.payload);
      }, reject);
    });
  };

  jogFactory.updateJog = function(jog) {
    return new Promise(function(resolve, reject) {
      ApiFactory.request('PUT', '/jog/' + jog._id, jog).then(function(response) {
        return resolve(response.payload);
      }, reject);
    });
  };

  jogFactory.deleteJog = function(id) {
    return new Promise(function(resolve, reject) {
      ApiFactory.request('DELETE', '/jog/' + id).then(function(response) {
        return resolve();
      }, reject);
    });
  };

  return jogFactory;
}]);
