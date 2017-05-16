import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './car.routes';
import AverageBuffer from '../../utils/average_buffer';
import DeltaBuffer from '../../utils/delta_buffer';
import generate from '../../utils/chart.js';

var carChart;
var count = 0;
var initialPointRemoved = false;

var state_chart;
var state_count = 0;
var state_initialPointRemoved = false;

function plotNew(newData) {
  if(newData.CAN_Id==512||newData.CAN_Id==513){
    var object = new Object();
    object.Timestamp = newData.Timestamp;
    if(newData.throttle || newData.throttle == 0)object.throttle = newData.throttle/0x7FFF;
    if(newData.brake || newData.brake == 0)object.brake = (newData.brake - 0x190) / (0x3FF - 0x190);
    if(count<100&&initialPointRemoved)carChart.flow({
      json: object,
      length:0
    });
    else {
      carChart.flow({
        json:object,
        length:1
      });
      initialPointRemoved = true;
    }
    count++;
  }
  else if(newData.CAN_Id==1574){
    var object = new Object();
    object.Timestamp = newData.Timestamp;
    if (newData.state) object.state = newData.state;

    if (state_count < 100 && state_initialPointRemoved) state_chart.flow({
      json: object,
      length: 0
    });
    else {
      state_chart.flow({
        json: object
      });
      state_initialPointRemoved = true;
    }
    state_count++;
  }
}

export class CarController {
  /*@ngInject*/
  constructor($scope, $timeout, socket) {
    count = 0;
    initialPointRemoved = false;
    this.socket = socket;
    this.throttleBuffer = new AverageBuffer(50,['throttle'],plotNew);
    this.brakeBuffer = new AverageBuffer(50,['brake'],plotNew);
    this.carStateBuffer = new DeltaBuffer(['state'],plotNew);
    this.carStateBuffer.begin();

    carChart = generate('#car-chart',[],'Timestamp',['throttle', 'brake'],'line',
      {
        'throttle': 'Throttle',
        'brake': 'Brake'
      },
      {
        tick: {
          min: 0,
          max: 1,
          format: d3.format("%")
        }
      },false);

    state_chart = generate('#state-chart',[],'Timestamp',['state'],'step',
      {
        'state': 'State'
      },
      {
        max: 5,
        min: 0,
        tick: {
          format: function (d) {
            switch (d) {
              case 0:
                return "Startup";
              case 1:
                return "LV";
              case 2:
                return "Precharging";
              case 3:
                return "HV Enabled";
              case 4:
                return "Drive";
              case 5:
                return "Fault";
            }
          }
        }
      },false);

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('car');
    });
  }

  $onInit() {
    this.socket.syncUpdates('car', function(data){
      if(data){
        if(data.CAN_Id==512) this.throttleBuffer.push(data);
        else if(data.CAN_Id==513) this.brakeBuffer.push(data);
        else if(data.CAN_Id==1574) this.carStateBuffer.push(data);
      }
    }.bind(this));
  }
}

export default angular.module('dataLoggerWebApp.car', [uiRouter])
  .config(routing)
  .component('car', {
    template: require('./car.html'),
    controller: CarController
  })
  .name;
