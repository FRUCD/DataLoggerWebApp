import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './overview.routes';



function updateThrottleBrake(throttle,brake) {
  if(throttle)
  {
    angular.element(document.querySelector('#throttle-bar')).html(Math.round(throttle / 0x7FF) + "%");
    document.getElementById("throttle-bar").style.height = (4 * throttle) / 0x7FF + "px";
  }
  if(brake)
  {
    angular.element(document.querySelector('#brake-bar')).html(Math.round(brake / 0x7FF) + "%");
    document.getElementById("brake-bar").style.height = (4 * brake) / 0x7FF + "px";
  }

}

export class OverviewController {
  /*@ngInject*/
  constructor($scope, $timeout, socket) {
    this.socket = socket;
    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('car');
    });
  }

  $onInit() {
    this.socket.syncUpdates('car', function(data){
      if(data){
        if(data.CAN_Id==512) updateThrottleBrake(data.throttle,null);
        else if(data.CAN_Id==513) updateThrottleBrake(null,data.brake);
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
