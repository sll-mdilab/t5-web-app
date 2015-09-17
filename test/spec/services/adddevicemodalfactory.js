'use strict';

describe('Service: addDeviceModalFactory', function () {

  // load the service's module
  beforeEach(module('fhirWebApp'));

  // instantiate service
  var addDeviceModalFactory;
  beforeEach(inject(function (_addDeviceModalFactory_) {
    addDeviceModalFactory = _addDeviceModalFactory_;
  }));

  it('should do something', function () {
    expect(!!addDeviceModalFactory).toBe(true);
  });

});
