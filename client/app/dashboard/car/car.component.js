import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './car.routes';

import c3 from 'c3';

var carChart;
var initialPointsRemoved = false;
function plotNew(newData) {
  if(initialPointsRemoved) {
    carChart.flow({
      columns: newData,
      length: 0
    });
  } else {
    carChart.flow({
      columns: newData
    });
    initialPointsRemoved = true;
  }
}

export class CarController {
  /*@ngInject*/
  constructor($scope, $timeout, socket) {
    this.socket = socket;

    carChart = c3.generate({
      bindto: '#car-chart',
      data: {
        xs: {
          'throttleY': 'throttleX',
          'brakeY': 'brakeX'
        },
        columns: [
          ['throttleX',0],
          ['brakeX',0],
          ['throttleY',0],
          ['brakeY',0]
        ],
        names: {
          'throttleY': 'Throttle',
          'brakeY': 'Brake'
        }
      },
      axis: {
        y: {
          tick: {
            format: d3.format("%")
          }
        }
      },
      tooltip: {
        format: {
        title: function (d) { return 'Time ' + d; },
        value: d3.format('%')
        }
      },
      subchart: {
        show: true
      }
    });

    //Testing
    var testData = [
      ['throttleX', 1],
      ['brakeX', 1],
      ['throttleY', .40],
      ['brakeY', 0]
    ];
    var testData2 = [
      ['throttleX', 2],
      ['brakeX', 2],
      ['throttleY', .60],
      ['brakeY', 0]
    ];
    var testData3 = [
      ['throttleX', 3],
      ['brakeX', 3],
      ['throttleY', .70],
      ['brakeY', 0]
    ];
    var testData4 = [
      ['throttleX', 4],
      ['brakeX', 4],
      ['throttleY', .90],
      ['brakeY', 0]
    ];
    var testData5 = [
      ['throttleX', 5],
      ['brakeX', 5],
      ['throttleY', 1],
      ['brakeY', 0]
    ];
    var testData6 = [
      ['throttleX', 6],
      ['brakeX', 6],
      ['throttleY', 1],
      ['brakeY', 0]
    ];
    var testData7 = [
      ['throttleX', 7],
      ['brakeX', 7],
      ['throttleY', 0],
      ['brakeY', .25]
    ];
    var testData8 = [
      ['throttleX', 8],
      ['brakeX', 8],
      ['throttleY', 0],
      ['brakeY', .55]
    ];
    var testData9 = [
      ['throttleX', 9],
      ['brakeX', 9],
      ['throttleY', 0],
      ['brakeY', .88]
    ];
    var testData10 = [
      ['throttleX', 10],
      ['brakeX', 10],
      ['throttleY', 0],
      ['brakeY', 1]
    ];
    $timeout(function() {
      plotNew(testData);
    }, 3000);
    $timeout(function() {
      plotNew(testData2);
    }, 4000);
    $timeout(function() {
      plotNew(testData3);
    }, 5000);
    $timeout(function() {
      plotNew(testData4);
    }, 6000);
    $timeout(function() {
      plotNew(testData5);
    }, 7000);
    $timeout(function() {
      plotNew(testData6);
    }, 8000);
    $timeout(function() {
      plotNew(testData7);
    }, 9000);
    $timeout(function() {
      plotNew(testData8);
    }, 10000);
    $timeout(function() {
      plotNew(testData9);
      carChart.xgrids.add({
        value: 9,
        text: 'Steering out of range'
      });
    }, 11000);
    $timeout(function() {
      plotNew(testData10);
    }, 12000);


    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('car');
    });
  }

  $onInit() {
    this.socket.syncUpdates('car', plotNew);
  }
}

export default angular.module('dataLoggerWebApp.car', [uiRouter])
  .config(routing)
  .component('car', {
    template: require('./car.html'),
    controller: CarController
  })
  .name;
