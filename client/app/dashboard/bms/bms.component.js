import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './bms.routes';

import chart from '../../utils/chart'

import AverageBuffer from '../../utils/average_buffer'
import DeltaBuffer from '../../utils/delta_buffer'

export class BMSController {
  /*@ngInject*/
  constructor($scope, $timeout, socket) {
    this.socket = socket;
    this.bmsFlag_initialPointRemoved = false;
    this.bmsFlag_count = 0;
    this.bmsFlag_chart;

    this.temp_initialPointRemoved = false;
    this.temp_count = 0;
    this.temp_chart;

    this.batt_initialPointRemoved = false;
    this.batt_count = 0;
    this.batt_chart;

    this.plotNew = function plotNew(newData) {
      if (newData.CAN_Id == 904) {
        var object = new Object();
        object.Timestamp = newData.Timestamp;
        if (newData.min_voltage != undefined) object.min_voltage = newData.min_voltage;
        if (newData.max_voltage != undefined) object.max_voltage = newData.max_voltage;
        if (newData.pack_voltage != undefined) object.pack_voltage = newData.pack_voltage;
        if (this.batt_count < 10 && this.batt_initialPointRemoved) this.batt_chart.flow({
          json: object,
          length: 0
        });
        else {
          this.batt_chart.flow({
            json: object
          });
          this.batt_initialPointRemoved = true;
        }
        this.batt_count++;
      }
      else if (newData.CAN_Id == 1160) {
        var object = new Object();
        object.Timestamp = newData.Timestamp;
        if (newData.temp_array) {
          for (var i = 0; i < newData.temp_array.length; i++)
            object["temp" + i] = newData.temp_array[i];
        }
        if (this.temp_count < 10 && this.temp_initialPointRemoved) this.temp_chart.flow({
          json: object,
          length: 0
        });
        else {
          this.temp_chart.flow({
            json: object
          });
          this.temp_initialPointRemoved = true;
        }
        this.temp_count++;
      }
      else if (newData.CAN_Id == "392flag") {
        delete newData.CAN_Id;
        if (this.bmsFlag_count < 10 && this.bmsFlag_initialPointRemoved) this.bmsFlag_chart.flow({
          json: newData,
          length: 0
        });
        else {
          this.bmsFlag_chart.flow({
            json: newData
          });
          this.bmsFlag_initialPointRemoved = true;
        }
        this.bmsFlag_count++;
      }
    }.bind(this);
    this.voltageBuffer = new AverageBuffer(1000, ['min_voltage', 'max_voltage', 'pack_voltage'], this.plotNew);
    this.tempBuffer = new AverageBuffer(1000, ['temp_array'], this.plotNew);
    this.bmsStateBuffer = new DeltaBuffer(['flag'],this.plotNew);
    this.bmsStateBuffer.begin();

    this.temp_chart = chart.generate({
      bindto: '#temp-chart',
      data: {
        /*json: [
          {Timestamp: 0, temp0: 0, temp1: 0, temp2: 0, temp3: 0, temp4: 0, temp5: 0}
        ],*/
        json:[],
        xFormat: '%M.%S',
        keys: {
          x: 'Timestamp',
          value: ['temp0', 'temp1', 'temp2', 'temp3', 'temp4', 'temp5']
        },
        names: {
          'temp0': 'Temperature 1',
          'temp1': 'Temperature 2',
          'temp2': 'Temperature 3',
          'temp3': 'Temperature 4',
          'temp4': 'Temperature 5',
          'temp5': 'Temperature 6'
        }
      },
      line: {
        connectNull: true
      },
      axis: {
        y: {
          tick: {
            format: d3.format(".3")
          }
        },
        x: {
          type: 'timeseries',
          tick: {
            format: '%M:%S'
          },
          culling:true,
        }
      },
      transition: {
        duration: 0
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
      },
      size: {
        height: 600
      },
      tooltip:{
        show: false
      }
    });
    this.batt_chart = chart.generate({
      bindto: '#battery-chart',
      data: {
        /*json: [
          {Timestamp: 0, min_voltage: 0, max_voltage: 0, pack_voltage: 0}
        ],*/
        json:[],
        xFormat: '%M.%S',
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
      line: {
        connectNull: true
      },
      axis: {
        y: {
          tick: {
            format: d3.format(".3")
          }
        },
        x: {
          type: 'timeseries',
          tick: {
            format: '%M:%S'
          },
          culling:true,
        }
      },
      transition: {
        duration: 0
      },
      subchart: {
        show: true
      },
      size: {
        height: 600
      },
      tooltip:{
        show: false
      }
    });
    let bmsvalues = ['Charge mode',
              'Pack temp limit exceeded',
              'Pack temp limit close',
              'Pack temperature low limit',  
              'Low SOC',
              'Critical SOC',
              'Imbalance',
              'Internal Fault',
              'Negative contactor closed',
              'Positive contactor closed',
              'Isolation fault',
              'Cell too high',
              'Cell too low',
              'Charge halt',
              'Full',
              'Precharge contactor closed'];
    this.bmsFlag_chart = chart.generate({
      bindto: '#bms-flag-chart',
      data: {
        /*json: [
         {Timestamp: 0, temp0: 0, temp1: 0, temp2: 0, temp3: 0, temp4: 0, temp5: 0}
         ],*/
        json:[],
        xFormat: '%M.%S',
        keys: {
          x: 'Timestamp',
          value: ['flag1','flag2','flag3','flag4','flag5','flag6','flag7','flag8','flag9','flag10','flag11','flag12','flag13','flag14','flag15','flag16']
        },
        type: "step"
      },
      axis: {
        y: {
          tick: {
            min:1, max:16,
            format: function(d){
              return bmsvalues[d-1];
            },
            culling: false
          }
        },
        x: {
          type: 'timeseries',
          tick: {
            format: '%M:%S'
          },
          culling:true
        }
      },
      transition: {
        duration: 0
      },
      subchart: {
        show: true
      },
      size: {
        height: 600
      },
      tooltip:{
        show: false
      }
    });

  $scope.$on('$destroy', function () {
      console.log("destroy called");
      socket.unsyncUpdates('temp');
      socket.unsyncUpdates('car');
      socket.unsyncUpdates('bms');
      this.temp_initialPointRemoved = false;
      this.temp_count = 0;
      this.batt_initialPointRemoved = false;
      this.batt_count = 0;
      this.tempBuffer.buffer.length = 0;
      this.voltageBuffer.buffer.length = 0;
      this.bmsStateBuffer.stop();
    }.bind(this));
  }
  $onInit() {
    this.socket.syncUpdates('temp', function (data) {
      if (data) {
        this.tempBuffer.push(data)
      }
    }.bind(this));

    this.socket.syncUpdates('bms', function (data) {
      if (data) {
        if (data.CAN_Id == 904) {
          this.voltageBuffer.push(data);
        }
        if (data.CAN_Id == 392){
			    this.bmsStateBuffer.push(data);
        }
      }
    }.bind(this));
  }
}

export default angular.module('dataLoggerWebApp.bms', [uiRouter])
  .config(routing)
  .component('bms', {
    template: require('./bms.html'),
    controller: BMSController
  })
  .name;
