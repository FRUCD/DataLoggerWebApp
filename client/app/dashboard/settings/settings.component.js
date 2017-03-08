import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './settings.routes';

import c3 from 'c3';

export class SettingsController {
  /*@ngInject*/
  constructor($scope,$http) {
    $scope.search = function(){
      $http({url:'/api/db/descriptors',method:'GET'}).then(function(data){
        $scope.list = data.data;
        $scope.selected = $scope.list[0].CAN_Id;
        $scope.new = new Object();
        $scope.new.CAN_Id = 0;
        $scope.new.PDO_Description = '';
        $scope.new.map = [];
        $scope.new.map.push({description:'',length:0,offset:0,dataType:''});
        $scope.loadForEdit();
      });
    };
    $scope.search();
    $scope.loadForEdit = function(){
      $http({url:`/api/db/descriptors/${$scope.selected}`,method:'GET'}).then(function(data){
        console.log(data);
        $scope.edit = data.data;
      });
    };
    $scope.createNew = function(){
      $http({url:`/api/db/descriptors/${$scope.new.CAN_Id}`,method:'PUT',data:$scope.new}).then(function(data){
        console.log(data);
        $scope.search();
      },function(msg){
        alert(msg.data);
      });
    };
    $scope.submit = function(){
      var edit = $scope.edit;
      for(var i=0;i<edit.map.length;i++){
        edit.map[i].offset = parseInt(edit.map[i].offset);
        edit.map[i].length = parseInt(edit.map[i].length);
        if(edit.map[i].array) edit.map[i].array.subLength = parseInt(edit.map[i].array.subLength);
        if(edit.map[i].dataType!="array") delete edit.map[i].array;
      }
      $http({url:`/api/db/descriptors/${$scope.selected}/`,method:'PUT',data:edit}).then(function(data){
        console.log(data.data);
        alert("success");
        // $scope.search();
      },function(msg){
        console.log(msg.data);
        alert(msg.data);
        $scope.loadForEdit();
      });
    };
    $scope.delete = function(deleteMap){
      if(deleteMap){
        $http({url:`/api/db/descriptors/${$scope.selected}/`,params:deleteMap,method:'DELETE'}).then(function(data){
          console.log(data.data);
          alert("success");
          $scope.loadForEdit();
        },function(res){
          alert(res.data);
        });
      }
      else{
        $http({url:`/api/db/descriptors/${$scope.selected}/`,method:'DELETE'}).then(function(data){
          console.log(data.data);
          alert("success");
          $scope.search();
        },function(res){
          alert(res.data);
        });
      }
    }
  }

  $onInit() {
  }
}

export default angular.module('dataLoggerWebApp.settings', [uiRouter])
  .config(routing)
  .component('settings', {
    template: require('./settings.html'),
    controller: SettingsController
  })
  .name;
