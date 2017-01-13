'use strict';

var app = angular.module('app');
app.factory('AuthFactory', ['$http', 'CacheFactory', 'ApiFactory', function($http, CacheFactory, ApiFactory) {
  let authFactory = {};

  let authCache;
  if(CacheFactory.get('authCache')) {
    authCache = CacheFactory.get('authCache');
  } else {
    authCache = CacheFactory('authCache', {
      storageMode: 'localStorage',
      maxAge: 1000 * 60 * 60 * 12,  // 12 hours
      deleteOnExpire: 'aggressive',
      recycleFreq: 1000 * 60        // clean the cache every minute
    });
  }

  authFactory.getUser = function() {
    let cache = authCache.get('user');
    if(cache) {
      if(!authCache.info('user').isExpired) {
        return cache.user;
      } else {
        return null;
      }
    }
    return null;
  };

  authFactory.login = function(credentials) {
    return new Promise(function(resolve, reject) {
      ApiFactory.request('POST', '/user/authenticate', credentials).then(function(response) {
        authCache.put('user', {
          token: response.payload.token,
          user: response.payload.user
        });
        return resolve();
      }, reject);
    });
  };

  authFactory.signup = function(credentials) {
    let data = angular.copy(credentials);
    data.name = JSON.stringify(credentials.name);
    return new Promise(function(resolve, reject) {
      ApiFactory.request('POST', '/user', data).then(function(response) {
        authCache.put('user', {
          token: response.payload.token,
          user: response.payload.user
        });
        return resolve();
      }, reject);
    });
  };

  authFactory.isAuthenticated = function() {
    return authFactory.getUser() ? !!authFactory.getUser()._id : false;
  };

  authFactory.isAuthorized = function(authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (authFactory.isAuthenticated() && authorizedRoles.indexOf(authFactory.getUser().role) !== -1);
  };

  return authFactory;
}]);
