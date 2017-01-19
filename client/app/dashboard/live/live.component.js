'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './live.routes';
import c3 from 'c3';

class Buffer{
  constructor(ms,key,callback){
    this.ms = ms;
    this.buffer = [];
    this.callback = callback;
    this.key = key;
  }
  push(point){
    var self = this;
    if(point instanceof Object){
      if(!this.start) this.start = point.Timestamp;
      if(point.Timestamp - this.start < this.ms){
        this.buffer.push(point);
      }
      else{
        var out = new Object();
        out.Timestamp = this.start;
        out.CAN_Id = this.buffer[0].CAN_Id;
        var sum=0;
        this.buffer.forEach(function(value){
          sum+=value[self.key];
        });
        sum = sum/this.buffer.length;
        out[this.key] = sum;
        this.start = undefined;
        this.buffer = [];
        this.callback(out);
      }
    }
  }
}

var initialPointRemoved = false;
var count = 0;
var throttleBrakeChart;

function plotNew(newData) {
  if(newData.CAN_Id==512||newData.CAN_Id==513){
    var object = new Object();
    object.Timestamp = newData.Timestamp;
    if(newData.throttle)object.throttle = newData.throttle/0x7FF;
    if(newData.brake)object.brake = newData.brake/0x7FF;
    if(count<100&&initialPointRemoved)throttleBrakeChart.flow({
      json: object,
      length:0
    });
    else {
      throttleBrakeChart.flow({
        json:object,
        length:1
      });
      initialPointRemoved = true;
    }
    count++;
  }
}

export class LiveComponent {
  /*@ngInject*/
  constructor($scope, $timeout, socket) {
    count = 0;
    initialPointRemoved = false;
    this.socket = socket;
    this.throttleBuffer = new Buffer(1000,'throttle',plotNew);
    this.brakeBuffer = new Buffer(1000,'brake',plotNew);
    throttleBrakeChart = c3.generate({
      bindto: '#throttle-brake-chart',
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
    this.socket.syncUpdates('car', function(data){
      if(data){
        if(data.CAN_Id==512) this.throttleBuffer.push(data);
        else if(data.CAN_Id==513) this.brakeBuffer.push(data);
      }
    }.bind(this));
  }
}

export default angular.module('dataLoggerWebApp.live', [uiRouter])
  .config(routes)
  .component('live', {
    template: require('./live.html'),
    controller: LiveComponent
  })
  .name;
