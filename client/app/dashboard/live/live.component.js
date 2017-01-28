'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './live.routes';
import c3 from 'c3';

class Buffer {
  constructor(ms, keys, callback) {
    this.ms = ms;
    this.buffer = [];
    this.callback = callback;
    this.keys = keys;
  }

  push(point) {
    var self = this;
    if (point instanceof Object) {
      if (!this.start) this.start = point.Timestamp;
      if (point.Timestamp - this.start < this.ms) {
        this.buffer.push(point);
      }
      else {
        var out = new Object();
        out.Timestamp = this.start;
        out.CAN_Id = this.buffer[0].CAN_Id;
        this.keys.forEach(function (key) {
          if (self.buffer[key] instanceof Array) {
            var sums = [];
            for (var i = 0; i < this.buffer[0][self.key].length; i++) {
              sums.push(0);
              this.buffer.forEach(function (value) {
                sums[i] += value[self.key][i];
              });
            }
            for (var i = 0; i < sums.length; i++) {
              sums[i] = sums[i] / this.buffer.length;
            }
            out[this.key] = sums;
          }
          else {
            out[key] = 0;
            self.buffer.forEach(function (value) {
              out[key] += value[key];

            });
            out[key] /= self.buffer.length;
          }
        });

        this.start = undefined;
        this.buffer = [];
        this.callback(out);
      }
    }
  }
}

var tb_initialPointRemoved = false;
var tb_count = 0;
var tb_chart;

var temp_initialPointRemoved = false;
var temp_count = 0;
var temp_chart;

var batt_initialPointRemoved = false;
var batt_count = 0;
var batt_chart;

function plotNew(newData) {
  if (newData.CAN_Id == 512 || newData.CAN_Id == 513) {
    var object = new Object();
    object.Timestamp = newData.Timestamp;
    if (newData.throttle) object.throttle = newData.throttle / 0x7FF;
    if (newData.brake) object.brake = newData.brake / 0x7FF;
    if (tb_count < 100 && tb_initialPointRemoved) tb_chart.flow({
      json: object,
      length: 0
    });
    else {
      tb_chart.flow({
        json: object,
        length: 1
      });
      tb_initialPointRemoved = true;
    }
    tb_count++;
  }
  else if (newData.CAN_Id == 904) {
    var object = new Object();
    object.Timestamp = newData.Timestamp;
    if (newData.min_voltage) object.min_voltage = newData.min_voltage;
    if (newData.max_voltage) object.max_voltage = newData.max_voltage;
    if (newData.pack_voltage) object.pack_voltage = newData.pack_voltage;
    if (batt_count < 100 && batt_initialPointRemoved) batt_chart.flow({
      json: object,
      length: 0
    });
    else {
      batt_chart.flow({
        json: object,
        length: 1
      });
      batt_initialPointRemoved = true;
    }
    batt_count++;
  }
  else if (newData.CAN_Id == 1160) {
    var object = new Object();
    object.Timestamp = newData.Timestamp;
    if (newData.temp_array) {
      object.temp1 = newData.temp_array[0];
      object.temp2 = newData.temp_array[1];
      object.temp3 = newData.temp_array[2];
      object.temp4 = newData.temp_array[3];
      object.temp5 = newData.temp_array[4];
      object.temp6 = newData.temp_array[5];

    }
    if (temp_count < 100 && temp_initialPointRemoved) temp_chart.flow({
      json: object,
      length: 0
    });
    else {
      temp_chart.flow({
        json: object,
        length: 1
      });
      temp_initialPointRemoved = true;
    }
    temp_count++;
  }
}

var genericsGraphMap = new Map();
var genericsBufferMap = new Map();
export class LiveComponent {
  /*@ngInject*/
  constructor($scope, $timeout, socket) {
    tb_count = 0;
    tb_initialPointRemoved = false;
    this.socket = socket;
    this.throttleBuffer = new Buffer(1000, ['throttle'], plotNew);
    this.brakeBuffer = new Buffer(1000, ['brake'], plotNew);
    this.tempBuffer = new Buffer(1000, ['temp_array'], plotNew);
    this.voltageBuffer = new Buffer(1000, ['min_voltage', 'max_voltage', 'pack_voltage'], plotNew);


    tb_chart = c3.generate({
      bindto: '#throttle-brake-chart',
      data: {
        json: [
          {Timestamp: 0, throttle: 0},
          {Timestamp: 0, brake: 0}
        ],
        keys: {
          x: 'Timestamp',
          value: ['throttle', 'brake']
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
          title: function (d) {
            return 'Time ' + d;
          },
          value: d3.format('%')
        }
      },
      subchart: {
        show: true
      }
    });

    temp_chart = c3.generate({
      bindto: '#temp-chart',
      data: {
        json: [
          {Timestamp: 0, temp1: 0},
          {Timestamp: 0, temp2: 0},
          {Timestamp: 0, temp3: 0},
          {Timestamp: 0, temp4: 0},
          {Timestamp: 0, temp5: 0},
          {Timestamp: 0, temp6: 0},
        ],
        keys: {
          x: 'Timestamp',
          value: ['temp1', 'temp2', 'temp3', 'temp4', 'temp5', 'temp6']
        },
        names: {
          'temp1': 'Temperature 1',
          'temp2': 'Temperature 2',
          'temp3': 'Temperature 3',
          'temp4': 'Temperature 4',
          'temp5': 'Temperature 5',
          'temp6': 'Temperature 6',

        }
      },
      axis: {
        y: {
          tick: {
            format: d3.format(".3")
          }
        }
      },
      tooltip: {
        format: {
          title: function (d) {
            return 'Time ' + d;
          },
          value: d3.format('.3')
        }
      },
      subchart: {
        show: true
      },
      grid: {
        y: {
          lines: [
            {value: 80, text: 'Threshold'}
          ]
        }
      }
    });

    batt_chart = c3.generate({
      bindto: '#battery-chart',
      data: {
        json: [
          {Timestamp: 0, min_voltage: 0},
          {Timestamp: 0, max_voltage: 0},
          {Timestamp: 0, pack_voltage: 0}
        ],
        keys: {
          x: 'Timestamp',
          value: ['min_voltage', 'max_voltage', 'pack_voltage']
        },
        names: {
          'min_voltage': 'Min Voltage',
          'max_voltage': 'Max Voltage',
          'pack_voltage': 'Pack Voltage'
        }
      },
      axis: {
        y: {
          tick: {
            format: d3.format(".3")
          }
        }
      },
      tooltip: {
        format: {
          title: function (d) {
            return 'Time ' + d;
          },
          value: d3.format('.3')
        }
      },
      subchart: {
        show: true
      }
    });

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('temp');
      socket.unsyncUpdates('car');
      socket.unsyncUpdates('bms');
    });
  }

  $onInit() {
    this.socket.syncUpdates('car', function (data) {
      if (data) {
        if (data.CAN_Id == 512) this.throttleBuffer.push(data);
        else if (data.CAN_Id == 513) this.brakeBuffer.push(data);
      }
    }.bind(this));
    this.socket.syncUpdates('temp', function (data) {
      if (data) {
        this.tempBuffer.push(data)
      }
    }.bind(this));
    this.socket.syncUpdates('bms', function (data) {
      if (data) {
        if (data.CAN_Id == 904) this.voltageBuffer.push(data);
      }
    }.bind(this));
    this.socket.syncUpdates('data', function (data) {
      if (data) {
        if (data.generics) {
          if (genericsGraphMap.get(data.CAN_Id))//can id already exists
          {
            genericsBufferMap.get(data.CAN_Id,).push(data);
          }
          else {
            var dataElements = new Array();
            var descriptionArr = new Array();
            data.generics.forEach(function (generic) {
              if (generic.dataType == 'decimal') {
                var simpleVal = new Object();
                simpleVal.Timestamp = generic.Timestamp;
                simpleVal[generic.description] = generic.value;
                dataElements.push(simpleVal);
                descriptionArr.push(generic.description);
              }
            });
            genericsBufferMap.set(data.CAN_Id, new Buffer(1000, descriptionArr, plotNew));
            genericsGraphMap.set(data.CAN_Id, c3.generate({
              data: {
                json: dataElements,
                keys: {
                  x: 'Timestamp',
                  value: descriptionArr
                }
              },
              axis: {
                y: {
                  tick: {
                    format: d3.format(".3")
                  }
                }
              },
              tooltip: {
                format: {
                  title: function (d) {
                    return 'Time ' + d;
                  },
                  value: d3.format('.3')
                }
              },
              subchart: {
                show: true
              }
            }));
          }
        }
        if (generic.dataType = 'array') {
          if (genericsGraphMap.get(data.CAN_Id))//can id already exists
          {

          }
          else {

          }
        }
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
