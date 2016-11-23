import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './car.routes';

import c3 from 'c3';

var carChart;
var count = 0;
function plotNew(newData) {
  if(count<100)carChart.flow({
    columns: newData,
    length:0
  });
  else carChart.flow({
    columns:newData,
    length:1
  });
  count++;
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
