import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './overview.routes';
import $ from 'jquery';
import c3 from 'c3';

function updateThrottleBrake(throttle, brake) {
  if(throttle || throttle == 0)
  {
    angular.element(document.querySelector('#throttle-bar')).html(Math.round((throttle / 0x7FFF) * 100) + "%");
    document.getElementById("throttle-bar").style.height = 300 * (throttle / 0x7FFF) + "px";
  }
  if(brake || brake == 0)
  {
    angular.element(document.querySelector('#brake-bar')).html(Math.round(((brake - 0x190) / (0x3FF - 0x190)) * 100) + "%");
    document.getElementById("brake-bar").style.height = 300 * ((brake - 0x190) / (0x3FF - 0x190)) + "px";
  }
}

function updateTemperatures($scope, temp) {
  var arrayLength = temp.temp_array.length;
  for (var i = 0; i < arrayLength; i++) {
    temp.temp_array[i] = parseInt(temp.temp_array[i].toString(16), 8);
    angular.element(document.querySelector('#t'+ i)).html(temp.temp_array[i] + "&degC");
    if(temp.temp_array[i]>150) temp.temp_array[i] = 150;
    document.getElementById("t"+i).style.backgroundColor = "hsl(" + (120 - temp.temp_array[i] / 150 * 120) + ", 75%, 50%)"
  }

}

function updateStates(bms,car)
{
  console.log(bms);
  console.log(car);
  var flagStrs = ["No error",
    "Charge mode",
    "Pack temperature limit exceeded",
    "Pack temperature limit close",
    "Pack temperature low limit",
    "Low SOC",
    "Critical SOC",
    "Imbalance",
    "Internal Fault (6804 comm failure)",
    "Negative contactor closed",
    "Positive contactor closed",
    "Isolation fault",
    "Cell too high",
    "Cell too low",
    "Charge halt",
    "Full",
    "Precharge contactor closed"
  ];
  if(bms){
    var bmsFlagMsg = "";
    for (var i = 0; i < bms.flag.length; i++) {
      if(bms.flag[i]){
          bmsFlagMsg += "<li>" + flagStrs[i] + "</li>";
      }
    }
    angular.element(document.querySelector('#bms-state')).html("<ul>" + bmsFlagMsg + "</ul>");
  }
  if(car) {
    var carState = "";
    switch (car.state)
    {
      case 0:
        carState = "Startup";
        break;
      case 1:
        carState = "LV";
        break;
      case 2:
        carState = "Precharging";
        break;
      case 3:
        carState = "HV Enabled";
        break;
      case 4:
        carState = "Drive";
        break;
      case 5:
        carState = "Fault";
        break;

    }
    angular.element(document.querySelector('#car-state')).html("Car State: " + carState);
  }
}

class SOCGauge {
    constructor() {
        this.gauge = c3.generate({
          bindto: "#soc-gauge",
          data: {
            json: [],
            keys: {
              x: 'Timestamp',
              value: ['soc']
            },
            names: 'SOC Percent',
            type: 'gauge'
          },
          axis:{
            x:{
              label: "SOC Percent"
            }
          },
          transition: {
            duration: 0
          },
          gauge:{
            units: '%',
            width: 40
          }
        });
    }
    updateSOC(soc) {
        this.gauge.load(
          {json: soc}
        );
    }
}

export class OverviewController {
  /*@ngInject*/
  constructor($scope, $http, socket) {
    this.socket = socket;
    this.scope = $scope;
    this.soc = new SOCGauge();
    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('car');
    });
    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('temp');
    });
    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('bms');
    });
    $http.get('/api/run/last',{params:{CAN_Id:1574}}).then(function(res){
      if(res.data && res.data.CAN_Id == 1574){
        if($("#car-state").text()=="Car State: "){
          updateStates(null, res.data);
        }
      }
    });
    $http.get('/api/run/last',{params:{CAN_Id:512}}).then(function(res){
      if(res.data && res.data.CAN_Id == 512){
        if($("#throttle-bar").text()==""){
          updateThrottleBrake(res.data.throttle,null);
        }
      }
    });
    $http.get('/api/run/last',{params:{CAN_Id:513}}).then(function(res){
      if(res.data && res.data.CAN_Id == 513){
        if($("#brake-bar").text()==""){
          updateThrottleBrake(null,res.data.brake);
        }
      }
    });
    $http.get('/api/run/last',{params:{CAN_Id:392}}).then(function(res){
      if(res.data && res.data.CAN_Id == 392){
        if($("#bms-state").text()==""){
          updateStates(res.data,null);
        }
      }
    });
    $http.get('/api/run/last',{params:{CAN_Id:1160}}).then(function(res){
      if(res.data && res.data.CAN_Id == 1160){
        if($("#t0").text()==""){
          updateTemperatures($scope,res.data);
        }
      }
    });
  }

  $onInit() {
    this.socket.syncUpdates('car', function (data) {
      if (data) {
        if (data.CAN_Id == 512) updateThrottleBrake(data.throttle, null);
        else if (data.CAN_Id == 513) updateThrottleBrake(null, data.brake);
        else if (data.CAN_Id == 1574) updateStates(null,data)
      }
    }.bind(this));
    this.socket.syncUpdates('temp', function (data) {
      if (data) {
        updateTemperatures(this.scope,data);
      }
    }.bind(this));
    this.socket.syncUpdates('bms', function (data) {
      if (data && data.CAN_Id == 392) {
        updateStates(data,null);
        this.soc.updateSOC(data);
      }
    }.bind(this));
  }
}

export default angular.module('dataLoggerWebApp.overview', [uiRouter])
  .config(routing)
  .component('overview', {
    template: require('./overview.html'),
    controller: OverviewController
  })
  .name;
