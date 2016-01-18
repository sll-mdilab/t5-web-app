'use strict';

/**
 * @ngdoc function
 * @name fhirWebApp.controller:OauthCtrl
 * @description
 * # OauthCtrl
 * Controller of the fhirWebApp
 */
angular.module('fhirWebApp')
  .controller('OauthCtrl', ['$scope', 'fhirConfig', function ($scope, fhirConfig) {
  	console.log('Running oauth controller');

  	$scope.statustext = 'Connecting...';

  	FHIR.oauth2.authorize({
  		server: fhirConfig.url,
  		client: {
  			client_id: fhirConfig.oauthClientId,
  			scope: 'openid profile',
  			redirect_uri: fhirConfig.oauthRedirectUri
  		}
  	}, function(message) {
  		console.log('Authorization failed: ' + message);
  	});

  }]);
