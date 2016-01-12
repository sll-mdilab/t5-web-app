'use strict';

/**
 * @ngdoc function
 * @name fhirWebApp.controller:OauthcallbackCtrl
 * @description
 * # OauthcallbackCtrl
 * Controller of the fhirWebApp
 */
angular.module('fhirWebApp')
  .controller('OauthcallbackCtrl', function ($scope) {
    
    console.log("Initiating OauthcallbackCtrl");
 // 	FHIR.oauth2.ready( function(smart) {
 //    	console.log('Ready callback.');

 //    	// smart.patient.api.search({type: "MedicationOrder", query: {patient: smart.patientId}
 //     //    }).then(function(r){
 //     //        r.data.entry.forEach(function(re) {
 //     //          var rx = re.resource;
 //     //          var row = $("<li> " + rx.medicationCodeableConcept.text + "</li>");
 //     //          $("#med_list").append(row);
 //     //        });
 //     //    });
	// },
	// 	function(message) {
 //    		console.log('Ready errback.: ' + message);
 //    });

  });
