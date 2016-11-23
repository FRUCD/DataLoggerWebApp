import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './car.routes';

import c3 from 'c3';

var carChart;
var count = 0;
function plotNew(newData) {
  if(newData.CAN_Id==512||newData.CAN_Id==513){
    var object = new Object();
    object.Timestamp = newData.Timestamp;
    if(newData.throttle)object.throttle = newData.throttle/0x7FF;
    if(newData.brake)object.brake = newData.brake/0x7FF;
    if(count<2000)carChart.flow({
      json: object,
      length:0
    });
    else carChart.flow({
      json:object,
      length:1
    });
    count++;
  }
}

export class CarController {
  /*@ngInject*/
  constructor($scope, $timeout, socket) {
    this.socket = socket;

    carChart = c3.generate({
      bindto: '#car-chart',
      data: {
        json: [
          {Timestamp:0,throttle:0},
          {Timestamp:0,brake:0}
        ],
        keys:{
          x:'Timestamp',
          value:['throttle','brake']
        },
        names: {
          'throttle': 'Throttle',
          'brake': 'Brake'
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
