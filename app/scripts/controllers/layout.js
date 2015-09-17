'use strict';

/**
 * @ngdoc function
 * @name fhirWebApp.controller:NavbarCtrl
 * @description
 * # NavbarCtrl
 * Controller of the fhirWebApp
 */
angular.module('fhirWebApp')
  .controller('LayoutCtrl', ['$scope', '$location', function ($scope, $location) {

    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };

    $scope.bodyHeightSmallerThanViewport = function() {
      return angular.element('body').height() < window.innerHeight;
    };
  }]);
