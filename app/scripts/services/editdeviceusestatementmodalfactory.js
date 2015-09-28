/**
 * @ngdoc service
 * @name fhirWebApp.editDeviceUseStatementModalFactory
 * @description
 * # editDeviceUseStatementModalFactory
 * Factory in the fhirWebApp.
 */
(function () {
  'use strict';

  angular
    .module('fhirWebApp')
    .factory('editDeviceUseStatementModalFactory', editDeviceUseStatementModalFactory);

  editDeviceUseStatementModalFactory.$inject = ['$modal', '$window'];

  function editDeviceUseStatementModalFactory($modal) {
    var vm = {};
    vm.editDeviceUseStatementCtrl = _editDeviceUseStatementCtrl;
    vm.editDeviceUseStatementCtrl.$inject = ['$scope', '$window', '$modalInstance', 't5Utils', 'activeStatement', 'fullDeviceList', 'fullReceiverList'];

    var factory = {
      show: show,
      forStatement: forStatement,
      setDeviceList: setDeviceList,
      setReceiverList: setReceiverList
    };

    return factory;

    function forStatement(deviceUseStatement) {
      vm.activeStatement = deviceUseStatement;
      return factory;
    }

    function setDeviceList(deviceList) {
      vm.deviceList = deviceList;
    }

    function setReceiverList(receiverList) {
      vm.receiverList = receiverList;
    }

    function show(confirmCallback, cancelCallback) {
      var modalInstance = $modal.open({
        animation: true,
        templateUrl: 'views/editdeviceusestatementmodal.html',
        controller: vm.editDeviceUseStatementCtrl,
        resolve: {
          activeStatement: function () {
            return vm.activeStatement;
          },
          fullDeviceList: function () {
            return vm.deviceList;
          },
          fullReceiverList: function () {
            return vm.receiverList;
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

    // Controller for the "Edit Device Use Statement" modal
    function _editDeviceUseStatementCtrl($scope, $window, $modalInstance, t5Utils, activeStatement, fullDeviceList, fullReceiverList) {
      $scope.receiverQuery = undefined;
      $scope.fullReceiverList = fullReceiverList;
      $scope.selectedReceivers = [];
      var activeReceivers = activeStatement.original.resource.extension.filter(function (item) {
        return t5Utils.containsIgnoreCase(item.url, 'brokeringReceiver');
      }).map(function (item) {
        var ref = item.valueResource.reference;
        var idx = ref.split('/').length > 1 ? 1 : 0;
        return ref.split('/')[idx];
      });

      for (var i = 0; i < fullReceiverList.length; i++) {
        $scope.selectedReceivers.push(activeReceivers.indexOf(fullReceiverList[i].id) > -1);
      }

      selectDevice(activeStatement, fullDeviceList);

      function selectDevice(statement, deviceList) {
        for (var idx = 0; idx < deviceList.length; idx++) {
          var device = deviceList[idx];
          if (t5Utils.containsIgnoreCase(statement.deviceId, device.id)) {
            $scope.selectedDevice = device;
            break;
          }
        }
      }

      $scope.ok = function () {
        var returnReceivers = $scope.fullReceiverList.filter(function (r, i) {
          return $scope.selectedReceivers[i];
        });
        $modalInstance.close({
          selectedDeviceUseStatement: activeStatement,
          selectedReceivers: returnReceivers,
          shouldRemove: false
        });
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };

      $scope.remove = function () {
        var deleteUser = $window.confirm('Bekräfta borttagning av enheten');
        if (deleteUser) {
          $modalInstance.close({selectedDeviceUseStatement: activeStatement, shouldRemove: true});
        }
      };
    }

  }
})();
