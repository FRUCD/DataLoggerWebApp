'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('dashboard', {
    url: '/dashboard',
    template: '<dashboard></dashboard>'
  });
}
