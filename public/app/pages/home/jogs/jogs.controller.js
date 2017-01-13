'use strict';

var app = angular.module('app');
app.controller('jogsController', ['$scope', 'JogFactory', 'HTTP_RESPONSES', '$timeout', '$mdToast', function($scope, JogFactory, HTTP_RESPONSES, $timeout, $mdToast) {
  let oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  $scope.date = {
    from: oneWeekAgo,
    to: new Date()
  };

  $scope.jogs = [];
  $scope.getJogs = function() {
    return $scope.jogs;
  };

  $scope.newJog = {
    date: new Date(),
    distance: 0,
    time: 0
  };

  $scope.computeAverageSpeed = function(jog) {
    let speed = jog.distance / jog.time;
    if(isNaN(speed)) return '...';
    return speed.toFixed(2);
  };

  $scope.createJog = function(jog) {
    JogFactory.createJog(jog).then(function() {
      showToast('Woohoo! Your jog was added.');
      // update jogs
      getJogs();
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
          // TODO logout and redirect to login page
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

  function getJogs() {
    JogFactory.getJogs().then(function(jogs) {
      $timeout(function() {
        $scope.jogs = jogs;
      });
    }, function(response) {
      switch(response.status) {
        case HTTP_RESPONSES.NotFound:
          showToast('No jogs yet. Pro tip: add one now!');
          break;
        case HTTP_RESPONSES.Forbidden:
          // TODO logout and redirect to login page
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
  }

  function showToast(msg) {
    $mdToast.show(
      $mdToast.simple()
        .textContent(msg)
        .position('top right')
        .action('ok')
        .hideDelay(5000)
    );
  }

  getJogs();
  showToast("askdnaskjd akshd as dkjh ");
}]);