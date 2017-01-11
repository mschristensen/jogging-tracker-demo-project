'use strict';

var app = angular.module('app');
app.factory('ApiFactory', ['$http', 'CacheFactory', 'API_URL', 'HTTP_RESPONSES', function($http, CacheFactory, API_URL, HTTP_RESPONSES) {
  let apiFactory = {};

  function makeFormEncoded(data, headersGetter) {
    var str = [];
    for (var d in data) {
      str.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    }
    return str.join("&");
  }

  // $http wrapper for making requests to the API
  apiFactory.request = function(method, endpoint, args) {
    // return a standard ES6 promise, rather than the promise spec used by $http
    return new Promise(function(resolve, reject) {
      if(['POST', 'GET', 'PUT', 'DELETE'].indexOf(method) === -1) {
        throw new Error('received unsupported HTTP method');
      }
      if(typeof endpoint !== 'string') {
        throw new Error('endpoint must be a string');
      }

      // ensure leading slash on endpoint
      if(endpoint[0] !== '/') endpoint = '/' + endpoint;

      let request = {
        method: method,
        url: API_URL + endpoint,
        headers: {}
      };

      // Attach headers
      if(method === 'POST' || method === 'PUT') {
        request.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        request.transformRequest = makeFormEncoded;
      }

      if(CacheFactory.get('authCache')) {
        // Attach the JWT iff. it exists and has not expired from the cache
        let authCache = CacheFactory.get('authCache');
        let user = authCache.get('user');
        if(user) {
          if(!authCache.info('user').isExpired) {
            request.headers.Authorization = user.token;
          }
        }
      }

      // Attach arguments
      if(args) {
        if(method === 'POST' || method === 'PUT') {
          request.data = args;  // attach to request body
        }
        if(method === 'GET') {
          request.params = args;  // attach as query string in URL
        }
      }

      $http(request).then(function(response) {
        return resolve({
          status: response.status,
          payload: response.data.payload
        });
      }, function(response) {
        if(!response) return reject({
          status: HTTP_RESPONSES.NoResponse,
          payload: null
        });
        return reject({
          status: response.status,
          payload: response.data.payload
        });
      });
    });
  };

  return apiFactory;
}]);
