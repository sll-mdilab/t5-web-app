'use strict';

describe('Service: addPatientModalFactory', function () {

  // load the service's module
  beforeEach(module('fhirWebApp'));

  // instantiate service
  var addPatientModalFactory;
  beforeEach(inject(function (_addPatientModalFactory_) {
    addPatientModalFactory = _addPatientModalFactory_;
  }));

  it('should do something', function () {
    expect(!!addPatientModalFactory).toBe(true);
  });

});
