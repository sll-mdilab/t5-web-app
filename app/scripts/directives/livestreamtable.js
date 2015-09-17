/**
 * @ngdoc directive
 * @name fhirWebApp.directive:liveStreamTable
 * @description
 * # liveStreamTable
 */
(function () {
  'use strict';
  angular
    .module('fhirWebApp')
    .directive('liveStreamTable', liveStreamTable);

  function liveStreamTable() {

    return {
      templateUrl: 'views/livestreamtable.html',
      restrict: 'E',
      scope: {
        data: '=tableData'
      }
    };
  }
})();
