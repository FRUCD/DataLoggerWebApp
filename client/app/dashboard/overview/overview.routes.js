'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('dashboard.overview', {
    url: '/overview',
    parent: 'dashboard',
    template: '<overview></overview>'
  });
}
