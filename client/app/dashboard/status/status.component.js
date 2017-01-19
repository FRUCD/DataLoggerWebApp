import angular from 'angular';

export class StatusController {
  /*@ngInject*/
  constructor($scope,$http) {
      $scope.status = "";
      $scope.current = function(){
          $http({url:'api/run/current',method:'GET'}).then(function(data){
              console.log(data);
              $scope.status = data.data;
          }).catch(function(error){
              console.error(error);
              setTimeout($scope.current(),1000);//cheap long-polling is cheap
          });
      };
      $scope.start = function(){
          $http({url:'api/run/start',method:'GET'}).then(function(data){
              $scope.status = data.data;
          });
      };
      $scope.stop = function(){
          $http({url:'api/run/stop',method:'GET'}).then(function(data){
              $scope.status = data.data;
          });
      }
      $scope.current();
  }

  $onInit() {
  }
}

export default angular.module('dataLoggerWebApp.status',[])
  .component('status', {
    template: require('./status.html'),
    controller: StatusController
  })
  .name;
