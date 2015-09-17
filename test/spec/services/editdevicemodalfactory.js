'use strict';

describe('Service: editDeviceModalFactory', function () {

  // load the service's module
  beforeEach(module('fhirWebApp'));

  // instantiate service
  var editDeviceModalFactory;
  beforeEach(inject(function (_editDeviceModalFactory_) {
    editDeviceModalFactory = _editDeviceModalFactory_;
  }));

  it('should do something', function () {
    expect(!!editDeviceModalFactory).toBe(true);
  });

});
