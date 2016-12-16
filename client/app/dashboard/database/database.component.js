import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './database.routes';

import c3 from 'c3';
const scrollAmount = 100;
export class DatabaseController {
  /*@ngInject*/
  constructor($scope,$http) {
    var self = this;
    this.start = 0;
    this.end = scrollAmount;
    $scope.datas = [];
    $http({url:"/api/db/collections",method:'GET'}).then(function(collections){ //collections is a sorted array of strings
      $scope.collections = collections.data;
      $scope.selected = collections.data[0];
    });
    $scope.search = function(){
      self.start = 0;
      self.end = scrollAmount;
      $http({url:`/api/db/collections/${$scope.selected}`,method:'GET',params:{start:self.start,end:self.end}}).then(function(data){
        console.log(data.data);
        $scope.datas = data.data;
        self.start +=scrollAmount;
        self.end+=data.data.length;
      });
    }
    $scope.load = function(){
      if(self.end-self.start==scrollAmount&&$scope.datas.length>0){
        $http({url:`/api/db/collections/${$scope.selected}`,method:'GET',params:{start:self.start,end:self.end}}).then(function(data){
          for(var i=0; i<data.data.length;i++){
            $scope.datas.push(data.data[i]);
          }
          self.start +=scrollAmount;
          self.end+=data.data.length;
        });
      }
    }
    $scope.download = function(type){
      $http({url:`/api/db/collections/${$scope.selected}/download/${type}`,method:'GET'});
    };
}

  $onInit() {
  }
}

export default angular.module('dataLoggerWebApp.database', [uiRouter])
  .config(routing)
  /*.directive('scroller',['$window',function($window){
    return {link:function(scope,element,attr){
        var container = angular.element($window);
        console.log("linked");
        console.log(container);
        container.onscroll = function(){
          console.log("scrolled");
          if(container.innerHeight + container.scrollY >= $document.body.offsetHeight) {
            console.log("bottom")
            scope.search();
          }
        };
      }
    };
  }])*/
  .component('database', {
    template: require('./database.html'),
    controller: DatabaseController
  })
.name;
