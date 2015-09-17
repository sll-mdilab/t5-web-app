'use strict';

/**
 * @ngdoc service
 * @name fhirWebApp.USER_ROLES
 * @description
 * # USER_ROLES
 * Constant in the fhirWebApp.
 */
angular.module('fhirWebApp')
  .constant('USER_ROLES', {
    all: '*',
    admin: 'admin',
    doctor: 'doctor',
    nurse: 'nurse',
    guest: 'guest'
  });

