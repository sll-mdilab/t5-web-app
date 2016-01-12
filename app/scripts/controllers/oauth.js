'use strict';

/**
 * @ngdoc function
 * @name fhirWebApp.controller:OauthCtrl
 * @description
 * # OauthCtrl
 * Controller of the fhirWebApp
 */
angular.module('fhirWebApp')
  .controller('OauthCtrl', ['$scope', function ($scope) {
  	console.log('Running oauth controller');

  	$scope.statustext = 'Connecting...';

  //  	var smart = FHIR.client({
	 //   serviceUrl: 'http://localhost:8380/fhir',
	 //   patientId: '1212121212',
	 //   auth: {
	 //   	type: 'bearer'
	 //   }
	 // });

   //	var pq = smart.patient.read();

 //  	FHIR.oauth2.ready( function(smart) {
 //    	console.log('Ready callback.');

 //    	smart.patient.api.search({type: "MedicationOrder", query: {patient: smart.patientId}
 //        }).then(function(r){
 //            r.data.entry.forEach(function(re) {
 //              var rx = re.resource;
 //              var row = $("<li> " + rx.medicationCodeableConcept.text + "</li>");
 //              $("#med_list").append(row);
 //            });
 //        });
	// },
	// 	function(message) {
 //    		console.log('Ready errback.: ' + message);
 //    });

  	// FHIR.oauth2.resolveAuthType('http://localhost:8380/fhir',
  	// 	function() {
  	// 		console.log('resolveAuthType callback.');
  	// 	}, function(messsage) {
  	// 		console.log('resolveAuthType errback.: ' + message);
  	// 	});


  	FHIR.oauth2.authorize({
  		server: 'https://localhost:8343/fhir',
  		client: {
  			client_id: 'capacity',
  			scope: 'email',
  			redirect_uri: 'https://localhost:9000/oauthcallback.html'
  		}
  	}, function(message) {
  		console.log('Authorization failed: ' + message);
  	});
  	

    //$fhir.oauth2.ready(function(smart){
   // 	$scope.statustext = 'OK';
	//});

  }]);
