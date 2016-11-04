'use strict';

export function routeConfig($urlRouterProvider, $locationProvider) {
  'ngInject';

  $urlRouterProvider.when('/dashboard', '/dashboard/overview');
  $urlRouterProvider.otherwise('/');

  $locationProvider.html5Mode(true);
}
