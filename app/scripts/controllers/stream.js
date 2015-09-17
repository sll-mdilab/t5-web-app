/**
 * @ngdoc function
 * @name fhirWebApp.controller:StreamCtrl
 * @description
 * # StreamCtrl
 * Controller of the fhirWebApp
 */
(function () {
  'use strict';
  angular
    .module('fhirWebApp')
    .controller('StreamCtrl', StreamCtrl);

  StreamCtrl.$inject = ['$scope', '$filter', 'fhirObservation', 'fhirEncounter', '$interval'];

  function StreamCtrl($scope, $filter, fhirObservation, fhirEncounter, $interval) {
    $scope.boxes = [{code: undefined}, {code: undefined}];
    $scope.currentPatient = '1212121212';
    $scope.noSignal = false;

    $scope.timeFrame = 2 * 60 * 1000; // 2 minutes


    var ACTIVE_ENCOUNTER_STATUS = {'planned': true, 'arrived': true, 'in-progress': true, 'onleave': true};

    $scope.init = function () {
      initWaveformConfig();
      updatePatients();
      updateCodeNames();
      updateValues($scope.boxes[0])();
      updateValues($scope.boxes[1])();
      $scope.startLiveStream();
    };

    function initWaveformConfig() {
      var waveformConfig = {};
      waveformConfig.dim = {height: 100, width: 435};
      waveformConfig.color = '#ffffff';
      waveformConfig.scales = {y: [0, 1]};

      $scope.codeDomains = {
        'MDC_ECG_LEAD_I': {y: [-0.55, 1.6]},
        'MDC_PRESS_BLD_ART': {y: [32, 141]},
        'MDC_PULS_OXIM_SAT_O2_WAVEFORM': {y: [0, 3.5]}
      };

      $scope.boxConfigs = [
        angular.copy(waveformConfig),
        angular.copy(waveformConfig)
      ];

    }

    $scope.codeSelect = function ($event, box, codeName) {
      box.code = codeName.coding[0].code;
      box.codeText = codeName.text;
      updateWaveformConfig(box);
      updateValues(box)();
    };

    function updateWaveformConfig(box) {
      var boxIdx = $scope.boxes.indexOf(box);
      if (boxIdx >= 0) {
        $scope.boxConfigs[boxIdx].code = box.code;
        $scope.boxConfigs[boxIdx].scales = $scope.codeDomains[box.code];
      }
    }

    $scope.patientSelect = function ($event, patient) {
      // patient has the form: "Patient/12345679"
      $scope.currentPatient = patient.substring(patient.lastIndexOf('/') + 1);
      updateCodeNames();
    };

    $scope.isWaveformData = function (box) {
      // If valueSampledData is defined it's of waveform type
      return box.observations ? !!box.observations[0].resource.valueSampledData : false;
    };

    var timeUntilOld = 10000;
    var updateValues = function (box) {
      return function () {
        if (!box.code) {
          return;
        }
        var startDate = new Date();
        startDate.setTime(startDate.getTime() - $scope.timeFrame);
        fhirObservation.getObservationsByPatientId($scope.currentPatient, '>=' + startDate.toISOString(), box.code).then(function (dataElements) {
          box.observations = $filter('orderBy')(dataElements.entry, 'resource.appliesDateTime', true);
          if (dataElements.total <= 0) {
            $scope.noSignal = true;
            console.warn('No entries were retrieved in the response');
          } else if (new Date() - new Date(box.observations[0].resource.appliesDateTime) > timeUntilOld) {
            $scope.noSignal = true;
            console.warn('Entries retrieved are older than ' + timeUntilOld + 'ms.');
          } else {
            $scope.noSignal = false;
          }
        });
      };
    };

    var updateCodeNames = function () {
      var startDate = new Date();
      startDate.setTime(startDate.getTime() - $scope.timeFrame);

      fhirObservation.getObservationSummaryByPatientId($scope.currentPatient, '>=' + startDate.toISOString()).then(function (dataElements) {
        if (dataElements.entry) {
          $scope.codeNames = dataElements.entry.map(function (entry) {
            var o = entry.resource.code;
            o.text = o.text || o.coding[0].code;
            return o;
          });
        } else {
          $scope.codeNames = {};
        }
      });
    };

    var updatePatients = function () {
      var startDate = new Date();
      startDate.setTime(startDate.getTime() - $scope.timeFrame);

      fhirEncounter.getAllActiveEncounters().then(function (dataElements) {
        $scope.encounters = dataElements.filter(function (entry) {
          return !!ACTIVE_ENCOUNTER_STATUS[entry.status];
        });

      });
    };

    // Continuous update
    $scope.$on('$destroy', function () {
      // Make sure that the interval is destroyed too
      $scope.stopLiveStream();
    });

    var stop;
    $scope.startLiveStream = function () {
      // If promise not yet resolved, do nothing (keep updating)
      if (angular.isDefined(stop)) {
        return;
      }
      // Default delay for update: 3 sec
      if (!angular.isDefined($scope.updateDelay)) {
        $scope.updateDelay = 1000;
      }

      stop = $interval(function () {
        updateValues($scope.boxes[0])();
        updateValues($scope.boxes[1])();
      }, $scope.updateDelay);
    };

    $scope.stopLiveStream = function () {
      if (angular.isDefined(stop)) {
        $interval.cancel(stop);
        stop = undefined;
      }
    };

    $scope.init();
  }
})();
