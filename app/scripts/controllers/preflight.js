'use strict';

/**
 * @ngdoc function
 * @name fhirWebApp.controller:PreflightCtrl
 * @description
 * # PreflightCtrl
 * Controller of the fhirWebApp
 */
angular.module('fhirWebApp')
  .controller('PreflightCtrl', ['$scope', '$modal', '$filter', '$window', 'fhirPatient', 'fhirEncounter', 't5Utils', function ($scope, $modal, $filter, $window, fhirPatient, fhirEncounter, t5Utils) {

    $scope.init = function () {
      $scope.updateEncounterList();
    };

    $scope.openAddPatientModal = function () {
      var modalInstance = $modal.open({
        animation: true,
        templateUrl: 'addPatient.html',
        controller: 'AddEncounterCtrl',
        size: 'lg'
      });

      modalInstance.result.then(function (result) {
        var newEncounter = result.encounter,
          printBracelet = result.printBracelet;

        if (newEncounter.patient.details) {
          fhirPatient.createPatient(angular.copy(newEncounter.patient.details));
          // Patient object saved, it's now safe to remove the complete patient resource from the encounter object which
          // is needed before saving the encounter.
          removeEmbeddedResources(newEncounter);
        }

        fhirEncounter.createEncounter(newEncounter).then(function () {
          $scope.updateEncounterList();
        });

        if (printBracelet) {
          $scope.printBracelet(newEncounter.patient.details);
        }
      });
    };

    function getPatientDetails(newEncounter) {
      fhirPatient.getPatient({
        patientId: newEncounter.patient.reference,
        includeResourceType: false
      }).then(function (patientDetails) {
        // Use the Patient template and populate existing properties with retrieved patient details
        newEncounter.patient.details = t5Utils.deepMerge({}, fhirPatient.instantiateEmptyPatient(), patientDetails);
      });
    }

    $scope.updateEncounterList = function () {
      fhirEncounter.getAllActiveEncounters().then(function (encounters) {
        $scope.encounters = [];
        angular.forEach(encounters, function (encounter) {
          var newEncounter = t5Utils.deepMerge({}, fhirEncounter.instantiateEmptyEncounter(), encounter);
          $scope.encounters.push(newEncounter);
          getPatientDetails(newEncounter);
        });
      });
    };

    $scope.printBracelet = function (patient) {
      if (patient) {
        $window.alert('Du försöker skriva ut armband för ' + patient.name[0].given[0] + ' ' + patient.name[0].family[0] + '. Olyckligt nog är ännu inte utskriftsfunktionen implementerad.');
      }
    };

    function removeEmbeddedResources(encounter) {
      delete encounter.patient.details;
      delete encounter.participant[0].individual.details;
    }

    $scope.removeEncounter = function (encounter) {
      var confirmRemoval = $window.confirm('Är du säker på att du vill skriva ut patienten?');
      if (confirmRemoval) {
        removeEmbeddedResources(encounter);
        fhirEncounter.dischargePatientByEncounter(encounter).then(function () {
          $scope.updateEncounterList();
        });
      }
    };

    $scope.updateEncounter = function (encounter) {
      var encounterToSave = angular.copy(encounter);
      removeEmbeddedResources(encounterToSave);
      fhirEncounter.updateEncounter(encounterToSave).then(function () {
        $scope.updateEncounterList();
        $window.alert('Information för ' + encounter.patient.details.identifier[0].value + ' har sparats');
      });
    };

    $scope.getAllActiveEncounters = function () {
      fhirEncounter.getAllActiveEncounters().then(function (encounters) {
        $scope.encounters = encounters;
        angular.forEach($scope.encounters, function (encounter) {
          fhirPatient.getPatient({
            patientId: encounter.patient.reference,
            includeResourceType: false
          }).then(function (patientDetails) {
            encounter.patient.details = patientDetails;
          });
        });
      });
    };

    $scope.init();
  }]);
