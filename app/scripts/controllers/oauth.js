'use strict';

/**
 * @ngdoc function
 * @name fhirWebApp.controller:OauthCtrl
 * @description
 * # OauthCtrl
 * Controller of the fhirWebApp
 */
angular.module('fhirWebApp')
  .controller('OauthCtrl', ['$scope', 'fhirConfig', 'fhirOauth', function ($scope, fhirConfig, fhirOauth) {
  	$scope.statustext = 'Connecting...';

    fhirOauth.authorize(function () {
  		console.log('Authorization failed: ' + message);
    });

  }]);
