'use strict';

/**
 * @ngdoc function
 * @name fhirWebApp.controller:AddEncounterCtrl
 * @description
 * # AddEncounterCtrl
 * Controller of the fhirWebApp
 */
angular.module('fhirWebApp')
  .controller('AddEncounterCtrl', ['$scope', '$modalInstance', '$timeout', 'fhirPatient', 'fhirEncounter', function ($scope, $modalInstance, $timeout, fhirPatient, fhirEncounter) {

    $scope.init = function () {
      $scope.newEncounter = fhirEncounter.instantiateEmptyEncounter();
      $scope.newEncounter.patient.details = fhirPatient.instantiateEmptyPatient();
      $scope.showExtendedConfirmText = false;
      $scope.genderToPhotoMap = {
        female: 'db/images/female-avatar.png',
        male: 'db/images/male-avatar.png',
        unknown: 'db/images/unknown-avatar.png',
        other: 'db/images/other-avatar.png'
      };
    };

    $scope.extendConfirmButtonText = function () {
      if ($scope.showExtendedConfirmText) {
        $timeout(function () {
          $scope.showExtendedConfirmText = !$scope.showExtendedConfirmText;
        }, 400);
      } else {
        $scope.showExtendedConfirmText = !$scope.showExtendedConfirmText;
      }
    };

    function getPatientDetails(id) {
      fhirPatient.getPatient({patientId: id, includeResourceType: true}).then(function (res) {
        // Success
        console.log('Using existing patient info');
        $scope.newEncounter.patient = {details: res};
        $scope.lookupInProgress = false;
      }, function () {
        // Error
        console.log('Patient not already in the system. Add it manually.');
      });
    }

    $scope.personInformationLookup = function (id) {
      $scope.lookupInProgress = true;
      // Timeout to simulate person information lookup.
      $scope.patientAlreadyExists = true;
      $timeout(function () {
        // Get patient information if patient already exist
        $scope.newEncounter = fhirEncounter.instantiateEmptyEncounter();
        $scope.newEncounter.patient.details = fhirPatient.instantiateEmptyPatient();
        getPatientDetails(id);
        $scope.patientSearch = undefined;
      }, 1000);
    };

    function setPhotoBasedOnId() {
      var id = $scope.newEncounter.patient.details.identifier[0].value;
      // The second last number in a Swedish ID represents the gender: Even - Female, Odd - Male
      var genderNumber = id[id.length - 2];
      $scope.newEncounter.patient.details.photo[0].url = genderNumber % 2 === 0 ? $scope.genderToPhotoMap.female : $scope.genderToPhotoMap.male;
    }

    $scope.ok = function () {
      setPhotoBasedOnId();
      $scope.newEncounter.patient.reference = 'Patient/' + $scope.newEncounter.patient.details.identifier[0].value;
      $modalInstance.close({encounter: $scope.newEncounter, printBracelet: $scope.printBracelet});
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.init();
  }])
;
