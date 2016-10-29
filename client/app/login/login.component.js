import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './login.routes';

export class LoginController {
  /*@ngInject*/
  constructor($scope, $state) {
    $scope.submit = function() { //TODO: make sure password matches something
      $state.go('dashboard');
    };
  }

  $onInit() {
  }
}

export default angular.module('dataLoggerWebApp.login', [uiRouter])
  .config(routing)
  .component('login', {
    template: require('./login.html'),
    controller: LoginController
  })
  .name;
