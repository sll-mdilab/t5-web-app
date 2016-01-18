'use strict';

/**
 * @ngdoc function
 * @name fhirWebApp.controller:OauthcallbackCtrl
 * @description
 * # OauthcallbackCtrl
 * Controller of the fhirWebApp
 */
angular.module('fhirWebApp')
  .controller('OauthcallbackCtrl',['$scope', '$rootScope', '$location', '$routeParams', 'fhirConfig', 'AuthService', 'AUTH_EVENTS', 'fhirOauth', function ($scope, $rootScope, $location, $routeParams, fhirConfig, authService, AUTH_EVENTS, fhirOauth) {

    function getDefaultPractitioner(userId) {
        var defaultPractitioner = 
        {
            "resourceType": "Practitioner",
            "id": userId,
            "identifier": [
              {
                "value": userId
              }
            ],
            "name": {
              "text": "Unregistered Practitioner"
            },
            "practitionerRole": [
              {
                "role": {
                  "coding": [
                    {
                      "system": "http://snomed.info/sct",
                      "code": "158965000",
                      "display": "Medical practitioner"
                    }
                  ]
                }
              }
            ]
        };
    }

    console.log($routeParams);
    console.log($location.absUrl());

    $scope.statustext = 'Fetching token...';
    console.log('Initiating Oauthcallback');

	FHIR.oauth2.settings.replaceBrowserHistory = false;
 	FHIR.oauth2.ready( function(smart) {
    	console.log('Ready callback.');
        
        $scope.statustext = 'Authentication successfull!';
        if(!$scope.$$phase) {
            $scope.$apply();
        }

    	fhirConfig.setAuthToken(smart.tokenResponse.access_token);
        console.log('Token: ' + smart.tokenResponse.access_token);
        console.log(smart.tokenResponse);

        smart.api.search({type: "Patient"}).always(function(){

            smart.user.read().done( function(currentPractitioner){
                $scope.setCurrentPractitioner(currentPractitioner);
                authService.login(currentPractitioner.id).then(function (user) {
                    console.log('Login sequence completed.');
                    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                    $scope.setCurrentUser(currentPractitioner.id);
                    // We need to initiate a digest because we are outside of angular here.
                    
                    $location.path('/pid');
                    // We need to initiate a digest because we are outside of angular here.
                    if(!$scope.$$phase) {
                        $scope.$apply();
                    }
                });
                
            }).fail(function() {
                console.log("Failed to fetch current practitioner, using default");

                $scope.setCurrentPractitioner(getDefaultPractitioner(smart.user.userId));
                authService.login(currentPractitioner.id).then(function (user) {
                    console.log('Login sequence completed.');
                    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                    $scope.setCurrentUser(currentPractitioner.id);
                    // We need to initiate a digest because we are outside of angular here.
                    
                    $location.path('/pid');
                    // We need to initiate a digest because we are outside of angular here.
                    if(!$scope.$$phase) {
                        $scope.$apply();
                    }
                });
            });
        });
	},
		function(message) {
    		$scope.statustext = 'Unable to fetch token. Authorization failed.';
    });

  }]);
