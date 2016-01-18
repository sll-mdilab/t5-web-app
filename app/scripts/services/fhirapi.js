'use strict';

/**
 * @ngdoc service
 * @name fhirWebApp.fhirAPI
 * @description
 * # fhirAPI
 * Constant in the fhirWebApp.
 */
angular.module('fhirWebApp')
  .constant('fhirAPI', {
    // Insert your API credentials here
    //apiUser: 'user',
    //apiKey: 'Y7RcVXmxtvY2i7q9rgZ9',
    //url: 'https://fhir.sll-mdilab.net/fhir/'
    apiUser: '',
    apiKey: '',
    url: 'https://localhost:8343/fhir/'
  });
