'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('dashboard', {
    abstract: true,
    url: '/dashboard',
    template: '<dashboard></dashboard>'
  });
}
