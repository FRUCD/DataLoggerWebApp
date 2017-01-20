'use strict';

describe('Component: LiveComponent', function() {
  // load the controller's module
  beforeEach(module('dataLoggerWebApp.live'));

  var LiveComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    LiveComponent = $componentController('live', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
