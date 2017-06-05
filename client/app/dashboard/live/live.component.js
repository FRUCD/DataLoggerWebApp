'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './live.routes';
import AverageBuffer from '../../utils/average_buffer.js'
import DeltaBuffer from '../../utils/delta_buffer.js'

import generate from '../../utils/chart.js';


var tb_initialPointRemoved = false;
var tb_count = 0;
var tb_chart;

var temp_initialPointRemoved = false;
var temp_count = 0;
var temp_chart;

var batt_initialPointRemoved = false;
var batt_count = 0;
var batt_chart;

var state_initialPointRemoved = false;
var state_count = 0;
var state_chart;

var bmsFlag_initialPointRemoved = false;
var bmsFlag_count = 0;
var bmsFlag_chart;

var bmsvalues;

var genericsGraphMap = new Map();
var genericsBufferMap = new Map();
var genericsIds = [];
var graphRenderQueue = [];

function createGraph(CAN_Id, descriptionArr, data, type){
  if(type == "flag"){
    let info = new Object();
    info.buffer = new DeltaBuffer(descriptionArr, plotNew);
    genericsBufferMap.set(CAN_Id, info);
    for(let description of descriptionArr){
      let bufferInfo = new Object();
      let graphData = new Object();
      graphData.buffer = {CAN_Id: CAN_Id};
      graphData.CAN_Id = CAN_Id + description;
      graphData.flagArr = [];
      for(var i = 1; i < data[description].length; i++){
        graphData.flagArr.push(description + i);
      }
      graphData.type = "step";
      graphData.graphFormat = data;
      graphRenderQueue.push(graphData);
      bufferInfo.count = 0;
      bufferInfo.firstPointRemoved = false;
      genericsBufferMap.set(CAN_Id + description, bufferInfo);
    }
  }
  else{
    let bufferInfo = new Object();
    let graphData = new Object();
    graphData.buffer = {CAN_Id: CAN_Id};
    graphData.CAN_Id = CAN_Id;
    graphData.descriptionArr = descriptionArr;
    graphData.graphFormat = data;
    if(type == 'decimal'){
      bufferInfo.buffer = new AverageBuffer(1000, descriptionArr, plotNew);
      graphData.type = "line";
    }
    else if(type == 'state'){
      bufferInfo.buffer = new DeltaBuffer(descriptionArr, plotNew);
      graphData.type = "step";
    }
    graphRenderQueue.push(graphData);
    bufferInfo.count = 0;
    bufferInfo.firstPointRemoved = false;
    genericsBufferMap.set(CAN_Id, bufferInfo);
    console.log(genericsBufferMap);
  }
}
function bindGenerics(data, type){
  var descriptionArr = [];
  var simpleVal = new Object();
  simpleVal.Timestamp = data.Timestamp;
  simpleVal.CAN_Id = data.CAN_Id+type;
  data.generics.forEach(function (generic) {
    if (generic.dataType == type) {
      simpleVal[generic.description] = generic.value;
      descriptionArr.push(generic.description);
    }
    else if (generic.dataType == 'array' && generic.subDataType == type && generic.value instanceof Array) {
      descriptionArr.push(generic.description);
      for (var i = 0; i < generic.length; i++)
        simpleVal[generic.description + i] = generic.value[i];
     }
  });
  if(descriptionArr.length>0){
    if (genericsBufferMap.get(data.CAN_Id+type))//can id already exists
    {
      genericsBufferMap.get(data.CAN_Id+type).buffer.push(simpleVal);
    }
    else {
      if(type == "decimal" || type == "state"){
        if( angular.element(document.querySelector('#can'+data.CAN_Id+type)).length ) {
          console.log("div already exists");
        }
        else{
          genericsIds.push(data.CAN_Id+type);
        }
      }
      else{
        for(let description of descriptionArr){
          if( angular.element(document.querySelector('#can'+data.CAN_Id+type+description)).length ) {
            console.log("div already exists");
          }
          else{
              genericsIds.push(data.CAN_Id+type+description);
          }
        }
      }
      createGraph(data.CAN_Id+type, descriptionArr, simpleVal, type);
    }
  }
}
function plotNew(newData) {
  //console.log(newData);
  if (newData.CAN_Id == 512 || newData.CAN_Id == 513) {
    var object = new Object();
    object.Timestamp = newData.Timestamp;
    if (newData.throttle || newData.throttle == 0) object.throttle = newData.throttle / 0x7FFF;
    if (newData.brake || newData.brake == 0) object.brake = (newData.brake - 0x195) / (0x3FF - 0x195);
    if (tb_count < 50 && tb_initialPointRemoved) tb_chart.flow({
      json: object,
      length: 0
    });
    else {
      tb_chart.flow({
        json: object
      });
      tb_initialPointRemoved = true;
    }
    tb_count++;
  }
  else if (newData.CAN_Id == 1574) {
    var object = new Object();
    object.Timestamp = newData.Timestamp;
    if (newData.state) object.state = newData.state;

    if (state_count < 50 && state_initialPointRemoved) state_chart.flow({
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
  else if (newData.CAN_Id == 904) {
    var object = new Object();
    object.Timestamp = newData.Timestamp;
    if (newData.min_voltage != undefined) object.min_voltage = newData.min_voltage;
    if (newData.max_voltage != undefined) object.max_voltage = newData.max_voltage;
    if (newData.pack_voltage != undefined) object.pack_voltage = newData.pack_voltage;
    if (batt_count < 10 && batt_initialPointRemoved) batt_chart.flow({
      json: object,
      length: 0
    });
    else {
      batt_chart.flow({
        json: object
      });
      batt_initialPointRemoved = true;
    }
    batt_count++;
  }
  else if (newData.CAN_Id == 1160) {
    var object = new Object();
    object.Timestamp = newData.Timestamp;
    if (newData.temp_array) {
        for (var i = 0; i < newData.temp_array.length; i++)
          object["temp" + i] = parseInt(newData.temp_array[i].toString(16), 10);
      }
    if (temp_count < 50 && temp_initialPointRemoved) temp_chart.flow({
      json: object,
      length: 0
    });
    else {
      temp_chart.flow({
        json: object
      });
      temp_initialPointRemoved = true;
    }
    temp_count++;
  }
  else if (newData.CAN_Id == "392flag") {
    delete newData.CAN_Id;
    if (bmsFlag_count < 50 && bmsFlag_initialPointRemoved) bmsFlag_chart.flow({
      json: newData,
      length: 0
    });
    else {
      bmsFlag_chart.flow({
        json: newData
      });
      bmsFlag_initialPointRemoved = true;
    }
    bmsFlag_count++;

  }
  else {
    if (genericsGraphMap.get(newData.CAN_Id)) {
      var graph = genericsGraphMap.get(newData.CAN_Id);
      var canId = newData.CAN_Id;
      delete newData.CAN_Id;
      if (genericsBufferMap.get(canId).count < 50 && genericsBufferMap.get(canId).firstPointRemoved) graph.flow({
        json: newData,
        length: 0
      });
      else {
        graph.flow({
          json: newData
        });
        genericsBufferMap.get(canId).firstPointRemoved = true;
      }
      genericsBufferMap.get(canId).count++;
    }
  }
}

export class LiveComponent {
  /*@ngInject*/
  constructor($scope, $timeout, socket) {
    this.socket = socket;
    console.log("creating buffers");
    this.throttleBuffer = new AverageBuffer(100, ['throttle'], plotNew);
    console.log("created buffers");
    this.brakeBuffer = new AverageBuffer(100, ['brake'], plotNew);
    this.tempBuffer = new AverageBuffer(2000, ['temp_array'], plotNew);
    this.voltageBuffer = new AverageBuffer(1000, ['min_voltage', 'max_voltage', 'pack_voltage'], plotNew);
    this.carStateBuffer = new DeltaBuffer(['state'], plotNew);
    this.carStateBuffer.begin();
	  this.bmsStateBuffer = new DeltaBuffer(['flag'], plotNew);
    this.bmsStateBuffer.begin();

    $scope.genericsGraphMap = genericsGraphMap;
    $scope.genericsBufferMap = genericsBufferMap;
    $scope.genericsIds = genericsIds;

    tb_chart = generate('#throttle-brake-chart',[],'Timestamp',['throttle', 'brake'],'line',
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


    temp_chart = generate('#temp-chart',[],'Timestamp',['temp0', 'temp1', 'temp2', 'temp3', 'temp4', 'temp5'],'line',
      {
        'temp0': 'Temperature 1',
        'temp1': 'Temperature 2',
        'temp2': 'Temperature 3',
        'temp3': 'Temperature 4',
        'temp4': 'Temperature 5',
        'temp5': 'Temperature 6',
      },
      {
        min: 0,
        max: 60,
        tick: {
          format: d3.format(".2")
        }
      },false);


    batt_chart = generate('#battery-chart',[],'Timestamp',['min_voltage', 'max_voltage', 'pack_voltage'],'line',
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


     bmsvalues = ['Charge mode',
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


    bmsFlag_chart = generate('#bms-flag-chart',[],'Timestamp',['flag1', 'flag2', 'flag3', 'flag4', 'flag5', 'flag6', 'flag7', 'flag8', 'flag9', 'flag10', 'flag11', 'flag12', 'flag13', 'flag14', 'flag15','flag16']
      ,'step', {},
      {
        tick: {
          min:1, max:16,
          format: function(d){
            return bmsvalues[d-1];
          },
          culling: false
        }
      },false);
   // this.socket.emit("log","done making graphs");

    $scope.$on('updateGraphs', function () {
      console.log("Creating graphs");
      graphRenderQueue.forEach(function (graph) {
        console.log(genericsBufferMap.get(graph.buffer.CAN_Id));
        genericsBufferMap.get(graph.buffer.CAN_Id).buffer.begin();
        genericsGraphMap.set(graph.CAN_Id, generate('#can' + graph.CAN_Id,[],'Timestamp',
          graph.flagArr ? graph.flagArr : graph.descriptionArr,'line'
          ,{},{
            tick: {
              format: d3.format(".3")
            }
          },false));
      }, false);
      graphRenderQueue = [];
    });

    $scope.$on('$destroy', function () {
      console.log("destroy called");
      socket.unsyncUpdates('temp');
      socket.unsyncUpdates('car');
      socket.unsyncUpdates('bms');
      tb_initialPointRemoved = false;
      tb_count = 0;
      temp_initialPointRemoved = false;
      temp_count = 0;
      batt_initialPointRemoved = false;
      batt_count = 0;
      state_initialPointRemoved = false;
      state_count = 0;
      genericsBufferMap.forEach(function(value, key, map){
        value.buffer.stop();
      });
      genericsBufferMap.clear();
      genericsGraphMap.clear();
      delete $scope.genericsIds;
      this.carStateBuffer.stop();
      this.throttleBuffer.buffer.length = 0;
      this.brakeBuffer.buffer.length = 0;
      this.tempBuffer.buffer.length = 0;
      this.voltageBuffer.buffer.length = 0;
      this.bmsStateBuffer.stop();
    }.bind(this));
  }

  $onInit() {
    this.socket.syncUpdates('car', function (data) {
      if (data) {
        if (data.CAN_Id == 512) this.throttleBuffer.push(data);
        else if (data.CAN_Id == 513) this.brakeBuffer.push(data);
        else if (data.CAN_Id == 1574){
           this.carStateBuffer.push(data);
        }
      }
    }.bind(this));

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
    this.socket.syncUpdates('data', function (data) {
      if (data && data.generics) {
        bindGenerics(data, "decimal");
        bindGenerics(data, "state");
        bindGenerics(data, "flag");
      }
    }.bind(this));
  }
}

export default angular.module('dataLoggerWebApp.live', [uiRouter])
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
  .component('live', {
    template: require('./live.html'),
    controller: LiveComponent
  })
  .name;
