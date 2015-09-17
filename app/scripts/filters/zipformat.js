'use strict';

/**
 * @ngdoc filter
 * @name fhirWebApp.filter:zipFormat
 * @function
 * @description
 * # zipFormat
 * Filter in the fhirWebApp.
 */
angular.module('fhirWebApp')
  .filter('zipFormat', function () {
    return function (input) {
      var output = '';
      if (input){
        output = input.substr(0,3) + ' ' + input.substr(3);
      }
      return output;
    };
  });
