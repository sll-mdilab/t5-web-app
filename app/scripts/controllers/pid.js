'use strict';

/**
 * @ngdoc function
 * @name fhirWebApp.controller:PidCtrl
 * @description
 * # PidCtrl
 * Controller of the fhirWebApp
 */
angular.module('fhirWebApp')
  .controller('PidCtrl', ['$scope', '$window', '$modal', '$q', '$timeout', '$interval', 'fhirPatient', 'fhirDevice', 'fhirDeviceUseStatement', 'fhirEncounter', 'fhirObservation', 'fhirBrokeringReceiver', 'addDeviceModalFactory', 'addPatientModalFactory', 'editDeviceUseStatementModalFactory',
    function ($scope, $window, $modal, $q, $timeout, $interval, fhirPatient, fhirDevice, fhirDeviceUseStatement, fhirEncounter, fhirObservation, fhirBrokeringReceiver, addDeviceModalFactory, addPatientModalFactory, editDeviceUseStatementModalFactory) {

      $scope.patientSearch = '';
      $scope.deviceSearch = '';
      $scope.loadingChart = false;
      $scope.timeToInactive = 10 * 1000;

      function trimMillis(dateString) {
        return dateString.substring(0, dateString.length - 5) + 'Z';
      }

      $scope.timeFrames = [
        {label: '10min', value: 10 * 60 * 1000},
        {label: '30min', value: 30 * 60 * 1000},
        {label: '1h', value: 60 * 60 * 1000},
        {label: '2h', value: 2 * 60 * 60 * 1000}
      ];
      $scope.timeIntervalInMs = '600000'; // Preselect 10 min time frame option

      $scope.DEVICE_STATUS = {
        ACTIVE: {
          label: 'active',
          icon: 'flow-indicator flow-indicator-active glyphicon glyphicon-cloud-upload floating'
        },
        INACTIVE: {label: 'inactive', icon: 'flow-indicator flow-indicator-inactive glyphicon glyphicon-alert pulse'},
        UNKNOWN: {label: 'unknown', icon: 'flow-indicator glyphicon glyphicon-hourglass tossing'}
      };
      $scope.deviceActiveStatus = {};

      $scope.gridHeight = 150;

      $scope.getAllPatients = function () {
        var patientList = [];

        fhirEncounter.getAllActiveEncounters().then(function (encounters) {
          var prom = [];
          angular.forEach(encounters, function (encounter) {
            // Get patient details for each encounter, add them to patientList and wait for the promises to be resolved
            getPatientDetails(encounter, patientList, prom);
          });
          $q.all(prom).then(function () {
            $scope.fullPatientList = patientList;
          });
        });
      };

      function getPatientDetails(encounter, patientList, prom) {
        prom.push(fhirPatient.getPatient({
          patientId: encounter.patient.reference,
          includeResourceType: false
        }).then(function (fPatient) {
          patientList.push(simplifyFhirPatient(fPatient));
        }));
      }

      function simplifyFhirPatient(fPatient) {
        var entry = {};
        entry.patient = {
          id: fPatient.identifier[0].value,
          name: fPatient.name[0].given[0] + ' ' + fPatient.name[0].family[0],
          street: fPatient.address[0].line[0],
          zip: fPatient.address[0].postalCode,
          city: fPatient.address[0].city,
          profileURL: fPatient.photo ? fPatient.photo[0].url : undefined
        };
        return entry;
      }

      $scope.getAllDevices = function () {
        fhirDevice.get().then(function (devices) {
          $scope.fullDeviceList = devices;
        });
      };

      $scope.getAllReceivers = function () {
        fhirBrokeringReceiver.getAllReceivers().then(function (receivers) {
          $scope.fullReceiverList = receivers;
        });
      };

      $scope.addDevice = function (newDevice, receiverRefList) {
        $scope.showSpinner = true;
        fhirDeviceUseStatement.addDeviceToPatient($scope.patient.id, newDevice.id, $scope.currentUser.id, receiverRefList).then(
          function () {
            $scope.getActiveDeviceUseStatements($scope.patient.id);
          });
      };

      $scope.editDeviceUseStatement = function (row) {
        editDeviceUseStatementModalFactory.setDeviceList($scope.fullDeviceList);
        editDeviceUseStatementModalFactory.setReceiverList($scope.fullReceiverList);
        editDeviceUseStatementModalFactory.forStatement(row.entity).show(function (result) {
          // Success
          if (result.shouldRemove) {
            $scope.removeDevice(row.entity);
          } else {
            $scope.showSpinner = true;
            var updatedStatement = result.selectedDeviceUseStatement.original.resource;
            var refList = fhirBrokeringReceiver.toReferenceList(result.selectedReceivers);
            fhirDeviceUseStatement.addReceiversToDeviceUseStatement(updatedStatement, refList);
            fhirDeviceUseStatement.updateDeviceUseStatement(updatedStatement).then(function () {
              $scope.getActiveDeviceUseStatements($scope.patient.id);
            });
          }
        });
      };

      $scope.removeDevice = function (device) {
        $scope.showSpinner = true;
        var updatedStatement = angular.copy(device.original.resource);
        updatedStatement.whenUsed.end = trimMillis(new Date().toISOString());
        $scope.loadingChart = true;
        fhirDeviceUseStatement.updateDeviceUseStatement(updatedStatement).then(function () {
          $scope.showChart = false;
          $scope.loadingChart = false;
          $scope.getActiveDeviceUseStatements($scope.patient.id);
        });
      };

      $scope.getActiveDeviceUseStatements = function (patientId) {
        $scope.showSpinner = true;
        return fhirDeviceUseStatement.getDeviceUseStatementsByPatientId(patientId).then(
          function (deviceUseStatements) {
            var prom = [];
            var statementsWithDeviceInfo = [];
            // Add device information to each DeviceUseStatement
            angular.forEach(deviceUseStatements, function (statement) {
              prom.push(fhirDevice.getDeviceById(statement.deviceId).then(function (device) {
                statement.device = device;
                statementsWithDeviceInfo.push(statement);
              }));
            });
            $q.all(prom).then(function () {
              $scope.connections = statementsWithDeviceInfo;
              $scope.gridOptions.data = $scope.connections;
              $scope.showSpinner = false;
              $scope.updateDeviceStatuses();
              $scope.startContinuousUpdate();
            });
          });
      };

      // Continuous updates
      $scope.$on('$destroy', function () {
        // Make sure that the interval is destroyed too
        $scope.stopContinuousUpdate();
      });

      var stop;
      $scope.startContinuousUpdate = function () {
        $scope.isUpdating = true;
        // If promise not yet resolved, do nothing (keep updating)
        if (angular.isDefined(stop)) {
          return;
        }
        // Default delay for update: 3 sec
        if (!angular.isDefined($scope.updateDelay)) {
          $scope.updateDelay = 3 * 1000;
        }

        stop = $interval(function () {
          $scope.updateDeviceStatuses();
        }, $scope.updateDelay);
      };

      $scope.stopContinuousUpdate = function () {
        if (angular.isDefined(stop)) {
          $scope.isUpdating = false;
          $interval.cancel(stop);
          stop = undefined;
        }
      };
      // End continuous update

      // Patient Search Modal
      $scope.openPatientSearch = function () {
        addPatientModalFactory.setPatientList($scope.fullPatientList);
        addPatientModalFactory.show(function (selectedPatient) {
          $scope.patient = selectedPatient;
          $scope.getActiveDeviceUseStatements(selectedPatient.id);
        }, function () {
          // Dismiss function
        });
      };

      // Device Search Modal
      $scope.openDeviceSearch = function () {
        addDeviceModalFactory.setDeviceList($scope.fullDeviceList);
        addDeviceModalFactory.setReceiverList($scope.fullReceiverList);
        addDeviceModalFactory.show(function (result) {
          var refList = fhirBrokeringReceiver.toReferenceList(result.selectedReceivers);
          $scope.addDevice(result.selectedDevice, refList);
        }, function () {
          // Dismiss function
        });
      };

      $scope.getGridHeight = function () {
        return $scope.gridHeight;
      };

      $scope.updateDeviceStatuses = function () {
        angular.forEach($scope.connections, function (connection) {
          // If no data in a specific time period, count as inactive.
          var dateRange = '>=' + new Date(Date.now() - $scope.timeToInactive).toISOString();
          fhirObservation.getActiveObservationCodesByDeviceId(connection.device.id, dateRange).then(function (codes) {
            // Set appropriate status depending on if there are any active codes.
            $scope.deviceActiveStatus[connection.deviceId] = codes.length > 0 ? $scope.DEVICE_STATUS.ACTIVE : $scope.DEVICE_STATUS.INACTIVE;
          });
        });
      };

      $scope.getFlowIndicatorClass = function (row) {
        return $scope.deviceActiveStatus[row.entity.deviceId] ? $scope.deviceActiveStatus[row.entity.deviceId].icon : $scope.DEVICE_STATUS.UNKNOWN.icon;
      };

      $scope.fullDeviceList = [];
      $scope.fullPatientList = [];
      $scope.connections = [];
      $scope.patient = undefined;
      // Get all available patients
      $scope.getAllPatients();
      // Get all available devices
      $scope.getAllDevices();
      // Get all available receivers
      $scope.getAllReceivers();
      //@formatter:off
      var editTemplate =
        '<div class="text-center ui-grid-cell-contents">' +
          '<button type="button" class="btn btn-primary btn-xs" ng-click="grid.appScope.editDeviceUseStatement(row)" aria-label="Left Align">' +
            '<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>' +
          '</button>' +
        '</div>';

      var footerTemplate =
        '<button class="btn btn-success btn-xs btn-block add-device-btn" ng-click="grid.appScope.openDeviceSearch()">' +
          '<i class="glyphicon glyphicon-plus"></i>' +
        '</button>';

      var timeTemplate = '<div class="ui-grid-cell-contents" am-time-ago="row.entity.startDatetime" tooltip-placement="left" tooltip="Aktiv sedan {{row.entity.startDatetime}}"></div>';

      var statusTemplate =
        '<div class="text-center ui-grid-cell-contents">' +
          '<i ng-class="grid.appScope.getFlowIndicatorClass(row)"></i>' +
        '</div>';
      //@formatter:on
      $scope.gridOptions = {
        data: $scope.connections,
        showGridFooter: true,
        gridFooterTemplate: footerTemplate,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        columnDefs: [
          {name: 'Namn', field: 'device.name', width: '30%'},
          {name: 'ID', field: 'device.id', width: '20%'},
          {name: 'Inkopplad', field: 'startDatetime', width: '25%', cellTemplate: timeTemplate},
          {name: 'Status', field: 'activityStatus', width: '15%', cellTemplate: statusTemplate},
          {name: ' ', field: 'edit', width: '10%', cellTemplate: editTemplate}
        ]
      };
//2013-13-14T12:12:12.000
      function appendMillisIfNeeded(dateString) {
        if(dateString.length < 24) {
          return dateString.substring(0, dateString.length - 1) + '.000Z';
        } else {
          return dateString;
        }
      }

      function convertToChartDataModel(code, observationEntity) {
        var chartData = {};
        chartData.key = code;
        chartData.values = [];
        angular.forEach(observationEntity.entry, function (entry) {
          var obs = entry.resource;
          // Only add the series where valueQuantity is defined
          // valueString series are not of interest in this situation.
          if (obs.valueQuantity) {
            chartData.values.push({
              series: 0,
              x: new Date(obs.effectiveDateTime),
              y: obs.valueQuantity.value
            });
          }
        });
        return chartData;
      }

      $scope.getChartData = function () {
        $scope.loadingChart = true;
        var dateRange = '>=' + new Date(new Date().getTime() - Number($scope.timeIntervalInMs)).toISOString();
        var deviceId = $scope.selectedDeviceUseStatement.device.id;
        var prom = [];
        var dataArr = [];
        fhirObservation.getActiveObservationCodesByDeviceId(deviceId, dateRange).then(function (codes) {
          angular.forEach(codes, function (code) {
            prom.push(fhirObservation.getObservationsByDeviceId(deviceId, dateRange, code).then(function (observationEntity) {
              dataArr.push(convertToChartDataModel(code, observationEntity));
            }));
          });
        });

        $q.all(prom).then(function () {
          $scope.loadingChart = false;
          $scope.showChart = true;
          $scope.chartConfig.timeFrame = $scope.timeIntervalInMs;
          $scope.chartData = dataArr;
        });
      };

      $scope.gridOptions.onRegisterApi = function (gridApi) {
        //set gridApi on scope
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          $scope.showChart = false;
          // When a device is removed the removed row will be selected,
          // initializing a request for observations to show in the graph.
          // This will prevent that request to be sent.
          if ($scope.recentlyRemoved) {
            $scope.recentlyRemoved = false;
          } else if (row.isSelected && !$scope.recentlyRemoved) {
            $scope.selectedDeviceUseStatement = row.entity;
            $scope.chartConfig.brushPreset.west = row.entity.startDatetime;
            $scope.getChartData();
          }
        });
      };

      $scope.saveUpdates = function () {
        if ($scope.brushExtent) {
          var updatedStatement = angular.copy($scope.selectedDeviceUseStatement.original.resource);
          updatedStatement.whenUsed.start = trimMillis(new Date($scope.brushExtent[0]).toISOString());
          $scope.loadingChart = true;
          fhirDeviceUseStatement.updateDeviceUseStatement(updatedStatement).then(function () {
            $scope.showChart = false;
            $scope.loadingChart = false;
            $scope.getActiveDeviceUseStatements($scope.patient.id);
          });
        } else {
          $window.alert('Du har inte angivit ett tidsintervall.');
        }
      };

      $scope.hideLine = false;
      $scope.toggleLine = function () {
        $scope.hideLine = !$scope.hideLine;
      };

      $scope.chartConfig = {
        height: 200,
        brushPreset: {},
        trimSides: '0'
      };

      $scope.$watch('timeIntervalInMs', function () {
        if ($scope.showChart) {
          $scope.getChartData();
        }
      });
    }]);
