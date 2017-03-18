'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

const fileUpload = require('ng-file-upload');

import c3 from 'c3';

import routes from './display.routes';
import AverageBuffer from '../../utils/average_buffer.js';
import DeltaBuffer from '../../utils/delta_buffer.js';

function bindGenerics(message, type, ids, $scope){
  var descriptionArr = [];
  var simpleVal = new Object();
  simpleVal.Timestamp = message.Timestamp;
  simpleVal.CAN_Id = message.CAN_Id + type;
  message.generics.forEach(function (generic) {
    if (generic.dataType == type) {
      //if(type=="state")console.log(generic);
      simpleVal[generic.description] = generic.value;
      descriptionArr.push(generic.description);
    }
    else if (generic.dataType == 'array' && generic.subDataType == type && generic.value instanceof Array) {
      descriptionArr.push(generic.description);
      for (var i = 0; i < generic.value.length; i++)
        simpleVal[generic.description + i] = generic.value[i];
    }
  });
  if(descriptionArr.length>0){
    if(!$scope.buffers.has(simpleVal.CAN_Id)){
      console.log(simpleVal.CAN_Id);
      if(type == 'decimal') {
        $scope.buffers.set(simpleVal.CAN_Id, new AverageBuffer(1000, descriptionArr, function(object){
          if(!$scope.messages.has(this))$scope.messages.set(this,{buffer_Id:this,array:[]});
          $scope.messages.get(this).array.push(object);
        }.bind(simpleVal.CAN_Id)));
        ids.push(simpleVal.CAN_Id);
        var graphData = new Object();
        graphData.CAN_Id = simpleVal.CAN_Id;
        graphData.descriptionArr = descriptionArr;
        $scope.graphRenderQueue.push(graphData);
        console.log("buffers");
        console.log($scope.buffers);
      }
      else{
        $scope.buffers.set(simpleVal.CAN_Id, new DeltaBuffer(descriptionArr, function(object){
            if(!$scope.messages.has(object.CAN_Id))$scope.messages.set(object.CAN_Id,{buffer_Id:simpleVal.CAN_Id,array:[]});
            $scope.messages.get(object.CAN_Id).array.push(object);
          })); 
        if(type == "flag"){
          for(let description of descriptionArr){
            ids.push(simpleVal.CAN_Id + description);
            var graphData = new Object();
            graphData.CAN_Id = simpleVal.CAN_Id + description;
            graphData.flagArr = [];
            graphData.type = 'step';
            graphData.connectNull = false;
            for(var i = 1; i < simpleVal[description].length; i++){
              graphData.flagArr.push(description + i);
            }
            $scope.graphRenderQueue.push(graphData);
          }
        }
        else{
          ids.push(simpleVal.CAN_Id);
          var graphData = new Object();
          graphData.CAN_Id = simpleVal.CAN_Id;
          graphData.descriptionArr = descriptionArr;
          $scope.graphRenderQueue.push(graphData);
        }
      }
    }
    $scope.buffers.get(simpleVal.CAN_Id).push(simpleVal);
  }
}

export class DisplayComponent {
  /*@ngInject*/
  constructor($scope, $http, Upload) {
    $scope.graphRenderQueue = [];
    $scope.genericsIds = [];
    $scope.genericsGraphMap = new Map();

    this.tb_initialPointRemoved = false;
    this.tb_count = 0;

    this.temp_initialPointRemoved = false;
    this.temp_count = 0;

    this.batt_initialPointRemoved = false;
    this.batt_count = 0;

    this.tb_chart = c3.generate({
      bindto: '#throttle-brake-chart',
      data: {
        /*json: [
          {Timestamp: 0, throttle: 0},
          {Timestamp: 0, brake: 0}
        ],*/
        json:[],
        xFormat: '%M.%S',
        keys: {
          x: 'Timestamp',
          value: ['throttle', 'brake']
        },
        names: {
          'throttle': 'Throttle',
          'brake': 'Brake'
        }
      },
      line: {
        connectNull: true
      },
      axis: {
        y: {
          tick: {
            min: 0,
            max: 100,
            format: d3.format("%")
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
      tooltip:{
        show: false
      },
      transition: {
        duration: 0
      },
      subchart: {
        show: true
      },
      size: {
        height: 600
      }
    });

    this.temp_chart = c3.generate({
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
          'temp5': 'Temperature 6',

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
      tooltip:{
        show: false
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
      }
    });

    this.batt_chart = c3.generate({
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
      tooltip:{
        show: false
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
      }
    });
    this.state_chart = c3.generate({
      bindto: '#state-chart',
      data: {
        json:[],
        xFormat: '%M.%S',
        keys: {
          x: 'Timestamp',
          value: ['state']
        },
        names: {
          'state': 'State'
        },
        types: {
          state: 'step'
        }
      },
      line: {
        connectNull: true
      },
      axis: {
        y: {
          max: 5,
          min: 0,
          tick: {
            format: function(d){
              switch (d)
              {
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
        },
        x: {
          type: 'timeseries',
          tick: {
            format: '%M:%S'
          },
          culling:true,
        }
      },
      tooltip:{
        show: false
      },
      transition: {
        duration: 0
      },
      subchart: {
        show: true
      },
      size: {
        height: 600
      }
    });
    $http({url: '/api/db/collections', method: 'GET', ignoreLoadingBar: true}).then(function(collections) { //collections is a sorted array of strings
      $scope.collections = collections.data;
      $scope.selected = collections.data[0];
    });
    var self = this;
    $scope.load = function() {
      $http({url: `/api/db/collections/${$scope.selected}`, method: 'GET'}).then(function(data){
        self.process(data);
      },function(err){
        console.error(err);
      });
    };
    this.process = function(data){
      //console.log(data.data);
      $scope.messages = new Map();
      $scope.buffers = new Map();
      var ids = [];
      for(let message of data.data){
        //console.log($scope.messages);
        switch(message.CAN_Id){
          case 1574:
            var object = new Object();
            object.Timestamp = message.Timestamp;
            object.state = message.state;
            if(!$scope.messages.has(message.CAN_Id))$scope.messages.set(message.CAN_Id,{buffer_Id:message.CAN_Id, array:[]});
            let array = $scope.messages.get(message.CAN_Id).array;
            if(array.length>1 && array[array.length-1].state==object.state) array.pop();
            array.push(object);
            //let array =$scope.messages.get(message.CAN_Id);
            //if(array.length>0 && array[array.length-1]!=object.state) array.push(object);
            break;
          case 512:
            var object = new Object();
            object.Timestamp = message.Timestamp;
            object.throttle = message.throttle / 0x7FFF;
            if(!$scope.buffers.has("throttle")) $scope.buffers.set("throttle",new AverageBuffer(1000, ['throttle'], function(object){
              if(!$scope.messages.has(this))$scope.messages.set(this,{buffer_Id:"throttle",array:[]});
             $scope.messages.get(this).array.push(object);
            }.bind("tb_chart")));
            $scope.buffers.get("throttle").push(object);
            break;
          case 513:
            var object = new Object();
            object.Timestamp = message.Timestamp;
            object.brake = message.brake / 0x7FFF;

            if(!$scope.buffers.has("brake")) $scope.buffers.set("brake",new AverageBuffer(1000, ['brake'], function(object){
              if(!$scope.messages.has(this))$scope.messages.set(this,{buffer_Id:"brake",array:[]});
             $scope.messages.get(this).array.push(object);
            }.bind("tb_chart")));
            $scope.buffers.get("brake").push(object);
            break;
          case 904:
            var object = new Object();
            object.Timestamp = message.Timestamp;
            if (message.min_voltage != undefined) object.min_voltage = message.min_voltage;
            if (message.max_voltage != undefined) object.max_voltage = message.max_voltage;
            if (message.pack_voltage != undefined) object.pack_voltage = message.pack_voltage;
            if(!$scope.buffers.has(message.CAN_Id)) $scope.buffers.set(message.CAN_Id,new AverageBuffer(1000, ['min_voltage','max_voltage','pack_voltage'], function(object){
              if(!$scope.messages.has(this))$scope.messages.set(this,{buffer_Id:message.CAN_Id,array:[]});
             $scope.messages.get(this).array.push(object);
            }.bind(message.CAN_Id)));
            $scope.buffers.get(message.CAN_Id).push(object);
            break;
          case 1160:
            var object = new Object();
            object.Timestamp = message.Timestamp;
            if(!$scope.buffers.has(message.CAN_Id)) $scope.buffers.set(message.CAN_Id,new AverageBuffer(1000, ['temp_array'], function(object){
              if(!$scope.messages.has(this))$scope.messages.set(this,{buffer_Id:message.CAN_Id,array:[]});
              if (message.temp_array) {
              for (var i = 0; i < message.temp_array.length; i++)
                object["temp" + i] = message.temp_array[i];
              }
             $scope.messages.get(this).array.push(object);
            }.bind(message.CAN_Id)));
            $scope.buffers.get(message.CAN_Id).push(object);
            break;
          default:
            var descriptionArr = [];
            var simpleVal = new Object();
            if (message && message.generics) {
              bindGenerics(message, "decimal", ids, $scope);
              bindGenerics(message, "state", ids, $scope);
              bindGenerics(message, "flag", ids, $scope);
            }
        }
      }
      // flush buffer to messages
      $scope.buffers.forEach(function(buffer,CAN_Id){
        if(buffer instanceof DeltaBuffer){
          buffer.aggregate().forEach(function(value){
            $scope.messages.get(value.CAN_Id).array.push(value);
          });
        }
        else if(buffer instanceof AverageBuffer){
          if(CAN_Id == "throttle" || CAN_Id == "brake"){
            $scope.messages.get("tb_chart").array.push(buffer.aggregate());
          }
          else{
            $scope.messages.get(CAN_Id).array.push(buffer.aggregate());
          }
        }
      });
      $scope.genericsIds = ids;
      console.log($scope.messages);
      self.tb_chart.load({
        json:$scope.messages.get("tb_chart").array,
        keys:{
          x:'Timestamp',
          value:['throttle','brake']
        }
      });
      self.batt_chart.load({json:$scope.messages.get(904).array,keys:{
        x:'Timestamp',
        value:['min_voltage','max_voltage','pack_voltage']
      }
      });
      self.temp_chart.load({json:$scope.messages.get(1160).array,keys:{
        x:'Timestamp',
        value:['temp0', 'temp1', 'temp2', 'temp3', 'temp4', 'temp5']
      }});
      self.state_chart.load({json:$scope.messages.get(1574).array, keys:{
        x:'Timestamp',
        value:['state']
      }});
    }
    $scope.upload = function(theFile){
      console.log(theFile);
      Upload.upload({
            url: '/api/upload',
            data: {
              file: theFile
              }
        }).then(function(data){
          self.process(data);
        }, function (resp) {
            console.log(resp);
        });
    }
    $scope.$on('updateGraphs', function () {
      console.log("Creating graphs");
      $scope.graphRenderQueue.forEach(function (graph) {
        console.log(graph);
        if(!$scope.genericsGraphMap.has(graph.CAN_Id)) $scope.genericsGraphMap.set(graph.CAN_Id, c3.generate({
          bindto: '#can' + graph.CAN_Id,
          data: {
            json: [],
            xFormat: '%M.%S',
            keys: {
              x: 'Timestamp',
              value: graph.flagArr || graph.descriptionArr
            },
            type: graph.type || 'line'
          },
          line: {
            connectNull: graph.connectNull || false
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
          line:{
            step:{
              type:'step-after'
            }
          }
        }));
      });
      $scope.genericsGraphMap.forEach(function(graph,key){
        console.log(graph);
        graph.load({
          json:$scope.messages.get(key).array,
          keys:{
            x:'Timestamp',
            value: $scope.buffers.get($scope.messages.get(key).buffer_Id).getKeys()
          }
        })
      });
      $scope.graphRenderQueue.length = 0;
    });
  }
}
DisplayComponent.$inject = ["$scope", "$http", "Upload"];
export default angular.module('dataLoggerWebApp.display', [uiRouter, fileUpload])
  .config(routes)
    .directive('onFinishRender', function ($timeout) {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        if (scope.$last === true) {
          $timeout(function () {
            scope.$emit(attr.onFinishRender);
          });
        }
      }
    }
  })
  .component('display', {
    template: require('./display.html'),
    controller: DisplayComponent
  })
  .name;
