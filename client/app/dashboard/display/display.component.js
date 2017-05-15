'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

const fileUpload = require('ng-file-upload');

import routes from './display.routes';
import AverageBuffer from '../../utils/average_buffer.js';
import DeltaBuffer from '../../utils/delta_buffer.js';
import generate from '../../utils/chart.js'

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
      if(type == 'decimal') {
        $scope.buffers.set(simpleVal.CAN_Id, new AverageBuffer(1000, descriptionArr, function(object) {
          if(!$scope.messages.has(this))$scope.messages.set(this, {buffer_Id: this, array: []});
          $scope.messages.get(this).array.push(object);
        }.bind(simpleVal.CAN_Id)));
        ids.push(simpleVal.CAN_Id);
        var graphData = new Object();
        graphData.CAN_Id = simpleVal.CAN_Id;
        graphData.descriptionArr = descriptionArr;
        $scope.graphRenderQueue.push(graphData);
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

    this.tb_chart = generate('#throttle-brake-chart',[],'Timestamp',['throttle', 'brake'],'line',
      {
      'throttle': 'Throttle',
      'brake': 'Brake'
      },
      {
        min: 0,
        max: 1,
        tick: {
          format: d3.format("%")
        }
      },false);


    this.temp_chart = generate('#temp-chart',[],'Timestamp',['temp0', 'temp1', 'temp2', 'temp3', 'temp4', 'temp5'],'line',
      {
        'temp0': 'Temperature 1',
        'temp1': 'Temperature 2',
        'temp2': 'Temperature 3',
        'temp3': 'Temperature 4',
        'temp4': 'Temperature 5',
        'temp5': 'Temperature 6',
      },
      {
        tick: {
          format: d3.format(".3")
        }
      },false);

    this.batt_chart = generate('#battery-chart',[],'Timestamp',['min_voltage', 'max_voltage', 'pack_voltage'],'line',
      {
        'min_voltage': 'Min Voltage',
        'max_voltage': 'Max Voltage',
        'pack_voltage': 'Pack Voltage'
      },
      {
        tick: {
          format: function(d){return d/1000 + "V"}
        }
      },false);

    this.state_chart = generate('#state-chart',[],'Timestamp',['state'],'step',
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
            object.CAN_Id = message.CAN_Id;
            object.Timestamp = message.Timestamp;
            object.state = message.state;
            if(!$scope.buffers.has(message.CAN_Id)) $scope.buffers.set(message.CAN_Id, new DeltaBuffer(['state'], function(data){
              if(!$scope.messages.has(message.CAN_Id)) $scope.messages.set(message.CAN_Id,{buffer_Id:message.CAN_Id, array:[]});
              $scope.messages.get(message.CAN_Id).array.push(data);
            }));
            $scope.buffers.get(message.CAN_Id).push(object);
            //let array =$scope.messages.get(message.CAN_Id);
            //if(array.length>0 && array[array.length-1]!=object.state) array.push(object);
            break;
          case 512:
            var object = new Object();
            object.CAN_Id = message.CAN_Id;
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
            object.brake = (message.brake - 0x195) / (0x3FF - 0x195);
            object.CAN_Id = message.CAN_Id;

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
            object.CAN_Id = message.CAN_Id;

            if(!$scope.buffers.has(message.CAN_Id)) $scope.buffers.set(message.CAN_Id,new AverageBuffer(1000, ['min_voltage','max_voltage','pack_voltage'], function(object){
              if(!$scope.messages.has(this))$scope.messages.set(this,{buffer_Id:message.CAN_Id,array:[]});
              $scope.messages.get(this).array.push(object);
            }.bind(message.CAN_Id)));
            $scope.buffers.get(message.CAN_Id).push(object);
            break;
          case 1160:
            var object = new Object();
            object.Timestamp = message.Timestamp;
            object.temp_array = message.temp_array;
            object.CAN_Id = message.CAN_Id;
            for(var i = 0; i < message.temp_array.length; i++) {
              object.temp_array[i] = parseInt(message.temp_array[i].toString(16), 16);
            }
            if(!$scope.buffers.has(message.CAN_Id)) $scope.buffers.set(message.CAN_Id,new AverageBuffer(1000, ['temp_array'], function(buffer){
              let point = new Object();
              point.Timestamp = buffer.Timestamp;
              point.CAN_Id = buffer.CAN_Id;

              if(!$scope.messages.has(this))$scope.messages.set(this,{buffer_Id:message.CAN_Id,array:[]});
              for (var i = 0; i < buffer.temp_array.length; i++) {
                point['temp'+i] = buffer.temp_array[i];
              }
              $scope.messages.get(this).array.push(point);
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
      console.log($scope.messages);
      // flush buffer to messages
      $scope.buffers.forEach(function(buffer,CAN_Id){
        if(buffer instanceof DeltaBuffer){
          let values = buffer.aggregate();
          if(values) values.forEach(function(value){
            if(!$scope.messages.has(value.CAN_Id)) $scope.messages.set(value.CAN_Id, {buffer_Id: CAN_Id, array: []});
            $scope.messages.get(value.CAN_Id).array.push(value);
          });
        }
        else if(buffer instanceof AverageBuffer){
          if(CAN_Id == "throttle" || CAN_Id == "brake"){
            let value = buffer.aggregate();
            if(value) $scope.messages.get("tb_chart").array.push(value);
          }
          else{
            let value = buffer.aggregate();
            if(value) {
              if(!$scope.messages.has(value.CAN_Id)) $scope.messages.set(value.CAN_Id, {buffer_Id: CAN_Id, array: []});
               $scope.messages.get(value.CAN_Id).array.push(value);
            }
          }
        }
      });
      $scope.genericsIds = ids;
      try {
        self.tb_chart.load({
          json:$scope.messages.get("tb_chart").array,
          keys:{
            x:'Timestamp',
            value:['throttle','brake']
          }
        });
      }
      catch(error) {
        console.warn(error);
      }
      try {
        self.batt_chart.load({json:$scope.messages.get(904).array,keys:{
            x:'Timestamp',
            value:['min_voltage','max_voltage','pack_voltage']
        }});
      }
      catch(error) {
        console.warn(error);
      }
      try {
        self.temp_chart.load({json:$scope.messages.get(1160).array,keys:{
          x:'Timestamp',
          value:['temp0', 'temp1', 'temp2', 'temp3', 'temp4', 'temp5']
        }});
      }
      catch(error) {
        console.warn(error);
      }
      try {
        self.state_chart.load({json:$scope.messages.get(1574).array, keys:{
          x:'Timestamp',
          value:['state']
        }});
      }
      catch(error) {
        console.warn(error);
      }
      
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
        if(!$scope.genericsGraphMap.has(graph.CAN_Id)) $scope.genericsGraphMap.set(graph.CAN_Id, generate('#can' + graph.CAN_Id,[],'Timestamp',
          graph.flagArr ? graph.flagArr : graph.descriptionArr,'line'
        ,{},{
            tick: {
              format: d3.format(".3")
            }
          },false));
        $scope.genericsGraphMap.get(graph.CAN_Id).flow({
          json: $scope.messages.get(graph.CAN_Id).array,
          keys: {
            x: 'Timestamp',
            value: $scope.buffers.get($scope.messages.get(graph.CAN_Id).buffer_Id).getKeys()
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
