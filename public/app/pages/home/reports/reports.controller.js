'use strict';

var app = angular.module('app');
app.controller('reportsController', ['$scope', '$timeout', 'JogFactory', 'moment', function($scope, $timeout, JogFactory, moment) {
  let fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 7);
  let toDate = new Date();

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

  let dateSeries = createDateSeries(fromDate, toDate);
  $scope.charts = {
    distance: {
      labels: dateSeries,
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
      labels: dateSeries,
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
    from = moment(from);
    to = moment(to);

    let current = moment(from);
    if(to.diff(current, 'days') < 0) return [];

    let series = [];
    while(to.diff(current, 'days') >= 0) {
      series.push(current.toDate());
      current.add(1, 'days');
    }
    return series;
  }

  // Map the data points specified by <key> from the <jogs> array into date series arrays
  function extractJogData(from, to, jogs, keys) {
    // dataSeries contains one data array for each key
    let dataSeries = [];

    from = moment(from);
    to = moment(to);
    let length = to.diff(from, 'days');
    if(length < 0) return [];

    // initialise data points as null
    let nullArray = [];
    while(length + 1 > 0) {
      nullArray.push(null);
      length--;
    }
    for(let i = 0; i < keys.length; i++) {
      dataSeries.push(nullArray.slice()); // slice required to create clone of array
    }

    // for each data point, fill in the corresponding spot in the array for each data series
    for(let i = 0; i < jogs.length; i++) {
      for(let key in keys) {
        dataSeries[key][moment(jogs[i].date).diff(from, 'days') + 1] = jogs[i][keys[key]];
      }
    }

    return dataSeries;
  }

  JogFactory.getJogs(fromDate, toDate).then(function(jogs) {
    $timeout(function() {
      let dataSeries = extractJogData(fromDate, toDate, jogs, ['distance', 'time']);
      $scope.charts.distance.data = [dataSeries[0]];
      let averageSpeedData = [];
      for(let i = 0; i < dataSeries[1].length; i++) {
        let averageSpeed = dataSeries[0][i] / (dataSeries[1][i] / 60);
        averageSpeedData.push(averageSpeed.toFixed(2));
      }
      $scope.charts.speed.data = [averageSpeedData];
    });
  }, function() {
    console.log("err");
  });

}]);
