'use strict';

var app = angular.module('app');
app.factory('JogFactory', ['ApiFactory', function(ApiFactory) {
  let jogFactory = {};

  jogFactory.getJogs = function(fromDate, toDate) {
    return new Promise(function(resolve, reject) {
      let queryString = '';
      let fromDateQuery, toDateQuery;
      if(fromDate) fromDateQuery = 'fromDate=' + fromDate.toISOString();
      if(toDate) toDateQuery = 'toDate=' + toDate.toISOString();
      if(fromDateQuery && toDateQuery) {
        queryString = '?' + fromDateQuery + '&' + toDateQuery;
      } else {
        queryString = '?' + (fromDateQuery || toDateQuery);
      }
      ApiFactory.request('GET', '/jog' + queryString).then(function(response) {
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
