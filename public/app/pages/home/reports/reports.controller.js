'use strict';

var app = angular.module('app');
app.controller('reportsController', ['$scope', '$timeout', 'JogFactory', 'moment', 'HTTP_RESPONSES', function($scope, $timeout, JogFactory, moment, HTTP_RESPONSES) {
  let oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  $scope.date = {
    from: oneWeekAgo,
    to: new Date()
  };

  let chartOptions = {
    scales: {
      xAxes: [{
        type: 'time',
        unit: 'day',
        unitStepSize: 1,
        time: {
          unit: 'day',
          displayFormats: {
            'day': 'MMM Do'
          }
        },
        scaleLabel: {
          display: true,
          labelString: 'Date'
        }
      }],
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  };

  $scope.charts = {
    distance: {
      labels: [],
      data: [],
      series: ['Distance'],
      options: (function() {
        let options = JSON.parse(JSON.stringify(chartOptions)); // clone options object
        options.scales.yAxes[0].scaleLabel = {
          display: true,
          labelString: 'Distance (miles)'
        };
        return options;
      })()
    },
    speed: {
      labels: [],
      data: [],
      series: ['Average Speed'],
      options: (function() {
        let options = JSON.parse(JSON.stringify(chartOptions)); // clone options object
        options.scales.yAxes[0].scaleLabel = {
          display: true,
          labelString: 'Average Speed (mph)'
        };
        return options;
      })()
    }
  };

  // Create an array of dates (step 1 day) between the specified dates (inclusive)
  function createDateSeries(from, to) {
    if(!(from instanceof Date) || !(to instanceof Date)) return [];
    from = moment(from).startOf('day');
    to = moment(to).startOf('day');

    let current = moment(from);
    if(to.diff(current, 'days') < 0) return [];

    let series = [];
    while(to.diff(current, 'days') >= 0) {
      series.push(current.startOf('day').toDate());
      current.add(1, 'days');
    }
    return series;
  }

  // Map the data points specified by <key> from the <jogs> array into date series arrays
  function extractJogData(from, to, jogs, keys) {
    // dataSeries contains one data array for each key
    let dataSeries = [];

    from = moment(from).startOf('day');
    to = moment(to).startOf('day');

    let current = moment(from);
    if(to.diff(current, 'days') < 0) return [];

    let nullArray = [];
    while(to.diff(current, 'days') >= 0) {
      nullArray.push(null);
      current.add(1, 'days');
    }

    for(let i = 0; i < keys.length; i++) {
      dataSeries.push(nullArray.slice()); // slice required to create clone of array
    }

    // for each data point, fill in the corresponding spot in the array for each data series
    for(let i = 0; i < jogs.length; i++) {
      for(let key in keys) {
        dataSeries[key][moment(jogs[i].date).startOf('day').diff(from, 'days')] = jogs[i][keys[key]];
      }
    }

    return dataSeries;
  }

  $scope.fetchJogs = function() {
    let fromDate = moment($scope.date.from).startOf('day').toDate();
    let toDate = moment($scope.date.to).endOf('day').toDate();
    JogFactory.getJogs(fromDate, toDate).then(function(jogs) {
      $timeout(function() {
        // set X-axis data for specified dates
        let dateSeries = createDateSeries($scope.date.from, $scope.date.to);
        $scope.charts.distance.labels = dateSeries;
        $scope.charts.speed.labels = dateSeries;

        // set Y-axis data from the fetched jogs
        let dataSeries = extractJogData($scope.date.from, $scope.date.to, jogs, ['distance', 'time']);
        $scope.charts.distance.data = [dataSeries[0]];
        let averageSpeedData = [];
        for(let i = 0; i < dataSeries[1].length; i++) {
          let averageSpeed = dataSeries[0][i] / (dataSeries[1][i] / 60);
          averageSpeedData.push(averageSpeed.toFixed(2));
        }
        $scope.charts.speed.data = [averageSpeedData];
      });
    }, function(response) {
      switch(response.status) {
        case HTTP_RESPONSES.NotFound:
          $timeout(function() {
            $scope.charts.distance.data = [];
            $scope.charts.speed.data = [];
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

  $scope.fetchJogs();
}]);
