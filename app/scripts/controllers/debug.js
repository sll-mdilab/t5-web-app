'use strict';

/**
 * @ngdoc function
 * @name fhirWebApp.controller:DebugCtrl
 * @description
 * # DebugCtrl
 * Controller of the fhirWebApp
 */
angular.module('fhirWebApp')
  .controller('DebugCtrl', ['$scope', '$timeout', '$interval', '$window', 'DebugBackend', 'fhirDevice', function ($scope, $timeout, $interval, $window, DebugBackend, fhirDevice) {
    $scope.searchTerm = undefined;
    $scope.activeId = undefined;
    $scope.activeSummary = undefined;
    $scope.prevSummary = undefined;
    $scope.showSearch = true;
    $scope.activeTickets = {};
    $scope.slideEntityData = {};
    $scope.slideLogData = {};
    $scope.filterStartTimestamp = undefined;
    $scope.filterEndTimestamp = undefined;
    $scope.ctrSpeed = 250; // Speed for updating numbers in tickets. Keep it lower than update delay to get expected behaviour
    $scope.updateDelay = 3 * 1000; // Delay for updating the interface
    $scope.showMoreOptions = false;

    $scope.datePickerOptions = {
      'starting-day': 1
    };
    $scope.timePickerOptions = {
      'show-meridian': false,
      'readonly-input': false
    };

    $scope.dtPickerOpen = {
      from: false,
      to: false
    };

    $scope.retroLog = {
      from: undefined,
      to: undefined
    };

    $scope.openCalendar = function (e, date) {
      e.preventDefault();
      e.stopPropagation();

      $scope.dtPickerOpen[date] = true;
    };

    $scope.toggleMoreOptions = function () {
      $scope.showMoreOptions = !$scope.showMoreOptions;
      if (!$scope.showMoreOptions) {
        $scope.retroLog.from = undefined;
        $scope.retroLog.to = undefined;
      }
    };

    $scope.toggleEntitySlide = function () {
      $scope.showEntitySlide = !$scope.showEntitySlide;
      // Close Log Slide if opened
      if ($scope.showEntitySlide) {
        $scope.showLogSlide = false;
      }
    };

    $scope.toggleLogSlide = function () {
      $scope.showLogSlide = !$scope.showLogSlide;
      // Close Entity Slide if opened
      if ($scope.showLogSlide) {
        $scope.showEntitySlide = false;
      }
    };

    $scope.search = function (term) {
      // Hide search field on search
      $scope.toggleSearch();
      $scope.activeSummary = undefined;
      $scope.prevSummary = undefined;
      if($scope.retroLog.from){
        $scope.filterStartTimestamp = $scope.retroLog.from;
        $scope.filterEndTimestamp = $scope.retroLog.to;
        $scope.getDebugInformation(term); // No continuous update is needed.
      } else {
        $scope.filterStartTimestamp = new Date();
        $scope.getDebugInformation(term).then(function () {
          $scope.startContinuousUpdate();
        });
      }
    };

    $scope.toggleSearch = function () {
      $scope.showSearch = !$scope.showSearch;

      // Timeout to make it run last in digest cycle
      $timeout(function () {
        // Automatically focus the search field when if becomes visible.
        if ($scope.showSearch) {
          $window.document.getElementById('debug-search-input').focus();
        } else {
          $window.document.getElementById('debug-search-input').blur();
        }
      }, 100);

    };

    $scope.getDebugInformation = function (term) {
      $scope.activeId = term;
      var startDate = $scope.filterStartTimestamp || new Date();
      var endDate = $scope.filterEndTimestamp || new Date();
      return DebugBackend.getStatusSummary(term, startDate.toISOString(), endDate.toISOString()).then(function (data) {
        updateSummaries(data);
        // Turn off ticket animation when first animation is finished
        $timeout(function () {
          $scope.activeTickets = {};
          angular.forEach(data, function (v) {
            angular.forEach(v, function (entry) {
              $scope.activeTickets[entry.entity.identifier] = true;
            });
          });
        }, 2000);
        $scope.searchTerm = undefined;
      });
    };

    function updateSummaries(data) {
      $scope.prevSummary = $scope.activeSummary ? angular.copy($scope.activeSummary) : data;
      $scope.activeSummary = data;
    }

    function generateFileName(entityId) {
      return 't5-log-' + entityId + '-' + new Date().toISOString() + '.txt';
    }

    function saveLogToFile(logData) {
      var content = logData.messageLog.split('\n').join('\n\n');
      var blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
      var entityId = logData.deviceId ? ('device_' + logData.deviceId) : ('client_' + logData.sessionId);
      /* jshint undef: false */
      saveAs(blob, generateFileName(entityId));
    }

    /**
     * Download the log file for a device with log entries since search was initiated
     * @param data the object specified in `ticket-data` attribute for the `debug-ticket` directive
     * @returns {*} a promise
     */
    $scope.downloadDeviceLog = function (data) {
      return DebugBackend.getDeviceLogMessages(data.entity.identifier, $scope.filterStartTimestamp.toISOString(), new Date().toISOString()).then(function (logData) {
        saveLogToFile(logData);
      });
    };
    /**
     * Download the log file for a client with log entries since search was initiated
     * @param data the object specified in `ticket-data` attribute for the `debug-ticket` directive
     * @returns {*} a promise
     */
    $scope.downloadClientLog = function (data) {
      return DebugBackend.getClientLogMessages(data.entity.identifier, $scope.filterStartTimestamp.toISOString(), new Date().toISOString()).then(function (logData) {
        saveLogToFile(logData);
      });
    };

    /**
     * Function called when clicking the file button in a `debug-ticket`. Show the latest log entries for the
     * specific device.
     * @param data the object specified in `ticket-data` attribute for the `debug-ticket` directive
     * @returns {*}
     */
    $scope.showDeviceLogSneakPeek = function (data) {
      return $scope.showLogSneakPeek(data, 'device');
    };

    /**
     * Function called when clicking the file button in a `debug-ticket`. Show the latest log entries for the
     * specific client.
     * @param data the object specified in `ticket-data` attribute for the `debug-ticket` directive
     * @returns {*}
     */
    $scope.showClientLogSneakPeek = function (data) {
      return $scope.showLogSneakPeek(data, 'client');
    };

    $scope.showLogSneakPeek = function (data, type) {
      $scope.showLogSlide = true;
      $scope.showEntitySlide = false;
      $scope.stopLogUpdate();
      $scope.slideLogData = undefined;
      return updateLogData(data, type).then(function () {
        $scope.startLogUpdate(data, type);
      });
    };

    function convertLogResponse(log, type, entity) {
      return {log: log, type: type, entity: entity};
    }

    function updateLogData(data, type) {
      var start = new Date(Date.now() - 10 * 1000).toISOString();
      var end = new Date().toISOString();
      if (type === 'client') {
        return DebugBackend.getClientLogMessages(data.entity.identifier, start, end).then(function (log) {
            $scope.slideLogData = convertLogResponse(log, type, data.entity);
          }
        );
      } else if (type === 'device') {
        return DebugBackend.getDeviceLogMessages(data.entity.identifier, start, end).then(function (log) {
            $scope.slideLogData = convertLogResponse(log, type, data.entity);
          }
        );
      }
    }

    /**
     * Function called when clicking the info button in a `debug-ticket`. Shows information about the
     * specific device.
     * @param data the object specified in `ticket-data` attribute for the `debug-ticket` directive
     * @returns {*}
     */
    $scope.showDeviceDetails = function (data) {
      $scope.showEntitySlide = true;
      $scope.showLogSlide = false;
      $scope.slideEntityData = undefined;

      return fhirDevice.getDeviceById(data.entity.identifier).then(function (device) {
        $scope.slideEntityData = {
          name: device.name,
          identifier: device.id,
          photo: device.profileURL,
          type: 'device',
          entityType: device.type,
          manufacturer: device.manufacturer,
          // Mock description
          description: 'Ambitioni dedisse scripsisse iudicaretur. Tityre, tu patulae recubans sub tegmine fagi dolor. Morbi odio eros, volutpat ut pharetra vitae, lobortis sed nibh. Excepteur sint obcaecat cupiditat non proident culpa.'
        };
      });
    };

    /**
     * Function called when clicking the info button in a `debug-ticket`. Shows information about the
     * specific client.
     * @param data the object specified in `ticket-data` attribute for the `debug-ticket` directive
     * @returns {*}
     */
    $scope.showClientDetails = function (data) {
      $scope.showEntitySlide = true;
      $scope.showLogSlide = false;
      $scope.slideEntityData = undefined;

      // Client Details Mockup
      var details = {
        name: data.entity.displayName,
        identifier: data.entity.identifier,
        photo: undefined,
        type: 'client',
        entityType: 'PDMS',
        manufacturer: 'Karolinska Center of Innovation, Stockholm County Council (SLL)',
        // Mock description
        description: 'Ambitioni dedisse scripsisse iudicaretur. Tityre, tu patulae recubans sub tegmine fagi dolor. Morbi odio eros, volutpat ut pharetra vitae, lobortis sed nibh. Excepteur sint obcaecat cupiditat non proident culpa.'
      };
      // Simulate request for client details
      return $timeout(function () {
        $scope.slideEntityData = angular.copy(details);
      }, 1500);
    };

    // Continuous update of log
    var logStop;
    $scope.startLogUpdate = function (data, type) {
      // If promise not yet resolved, do nothing (keep updating)
      if (angular.isDefined(logStop)) {
        return;
      }
      // Default delay for update: 3 sec
      if (!angular.isDefined($scope.updateDelay)) {
        $scope.updateDelay = 3 * 1000;
      }
      logStop = $interval(function () {
        updateLogData(data, type);
      }, $scope.updateDelay);
    };

    $scope.stopLogUpdate = function () {
      if (angular.isDefined(logStop)) {
        $interval.cancel(logStop);
        logStop = undefined;
      }
    };

    // Real time update of the interface
    var stop;
    $scope.startContinuousUpdate = function () {
      // If promise not yet resolved, do nothing (keep updating)
      if (angular.isDefined(stop)) {
        return;
      }
      // Default delay for update: 3 sec
      if (!angular.isDefined($scope.updateDelay)) {
        $scope.updateDelay = 3 * 1000;
      }

      stop = $interval(function () {
        $scope.getDebugInformation($scope.activeId);
      }, $scope.updateDelay);
    };

    $scope.stopContinuousUpdate = function () {
      if (angular.isDefined(stop)) {
        $interval.cancel(stop);
        stop = undefined;
      }
    };

    $scope.$watch('showLogSlide', function (newVal) {
      if (!newVal) {
        $scope.stopLogUpdate();
      }
    });

    $scope.$on('$destroy', function () {
      // Make sure that the interval is destroyed too
      $scope.stopContinuousUpdate();
      $scope.stopLogUpdate();
    });

  }]);
