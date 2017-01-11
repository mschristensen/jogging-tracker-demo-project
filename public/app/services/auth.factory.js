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
    let user = authCache.get('user');
    if(user) {
      if(!authCache.info('user').isExpired) {
        return user;
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
          token: response.payload.token
        });
        return resolve();
      }, reject);
    });
  };

  authFactory.isAuthenticated = function() {
    return !!authFactory.getUser()._id;
  };

  authFactory.isAuthorized = function(authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (authFactory.isAuthenticated() && authorizedRoles.indexOf(authFactory.getUser().role) !== -1);
  };
  
  return authFactory;
}]);
