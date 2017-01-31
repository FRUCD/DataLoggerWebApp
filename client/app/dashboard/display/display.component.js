'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

const fileUpload = require('ng-file-upload');
import routes from './display.routes';

export class DisplayComponent {
  /*@ngInject*/
  constructor($scope, $http, Upload) {
    $scope.upload = function(theFile){
      console.log(theFile);
      Upload.upload({
            url: '/api/upload',
            data: {
              file: theFile
              }
        }).then(function (resp) {
            console.log(resp);
        }, function (resp) {
            console.log(resp);
        });
    }
  }
}
DisplayComponent.$inject = ["$scope", "$http", "Upload"];
export default angular.module('dataLoggerWebApp.display', [uiRouter, fileUpload])
  .config(routes)
  .component('display', {
    template: require('./display.html'),
    controller: DisplayComponent
  })
  .name;
