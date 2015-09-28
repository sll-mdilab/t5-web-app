/**
 * @ngdoc service
 * @name fhirWebApp.addDeviceModalFactory
 * @description
 * # addDeviceModalFactory
 * Factory in the fhirWebApp.
 */

(function () {
  'use strict';

  angular
    .module('fhirWebApp')
    .factory('addDeviceModalFactory', addDeviceModalFactory);

  addDeviceModalFactory.$inject = ['$modal', 'fhirDevice'];

  function addDeviceModalFactory($modal) {
    var vm = {};
    vm.addDeviceCtrl = _addDeviceCtrl;
    vm.addDeviceCtrl.$inject = ['$scope', '$modalInstance', 'fullDeviceList', 'fullReceiverList', 'fhirDevice'];

    return {
      show: show,
      setDeviceList: setDeviceList,
      setReceiverList: setReceiverList
    };

    function setDeviceList(deviceList){
      vm.fullDeviceList = deviceList;
    }

    function setReceiverList(receiverList){
      vm.fullReceiverList = receiverList;
    }

    function show(confirmCallback, cancelCallback) {
      var modalInstance = $modal.open({
        animation: true,
        templateUrl: 'views/adddevicemodal.html',
        controller: vm.addDeviceCtrl,
        resolve: {
          fullDeviceList: function () {
            return vm.fullDeviceList;
          },
          fullReceiverList: function () {
            return vm.fullReceiverList;
          }
        }
      });

      // Register confirm and cancel callbacks
      modalInstance.result.then(
        // if any, execute confirm callback
        function (data) {
          if (confirmCallback !== undefined) {
            confirmCallback(data);
          }
        },
        // if any, execute cancel callback
        function () {
          if (cancelCallback !== undefined) {
            cancelCallback();
          }
        });
    }

    // Controller for the "Add Device" modal
    function _addDeviceCtrl($scope, $modalInstance, fullDeviceList, fullReceiverList, fhirDevice) {

      $scope.receiverQuery = undefined;
      $scope.fullReceiverList = fullReceiverList;
      $scope.selectedReceivers = [];
      for (var i = 0; i < fullReceiverList.length; i++) {
        $scope.selectedReceivers.push(false);
      }

      $scope.searchDevice = function (term) {
        var deviceList = [];
        angular.forEach(fullDeviceList, function (item) {
          if (item.id.toUpperCase().indexOf(term.toUpperCase()) >= 0) {
            deviceList.push(item);
          }
        });
        $scope.deviceList = deviceList;
        return deviceList;
      };

      $scope.selectDevice = function (item) {
        $scope.selectedDevice = item;
        $scope.deviceSearch = undefined;
      };

      $scope.ok = function () {
        var returnReceivers = $scope.fullReceiverList.filter(function (r, i) {
          return $scope.selectedReceivers[i];
        });
        if(!$scope.selectedDevice){
          $scope.selectedDevice = fhirDevice.getDefaultDevice();
          $scope.selectedDevice.id = $scope.deviceSearch;
        }
        $modalInstance.close({selectedDevice: $scope.selectedDevice, selectedReceivers: returnReceivers});
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    }
  }
})();

