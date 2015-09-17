/**
 * @ngdoc service
 * @name fhirWebApp.addPatientModalFactory
 * @description
 * # addPatientModalFactory
 * Factory in the fhirWebApp.
 */

(function () {
  'use strict';

  angular
    .module('fhirWebApp')
    .factory('addPatientModalFactory', addPatientModalFactory);

  addPatientModalFactory.$inject = ['$modal'];

  function addPatientModalFactory($modal) {
    var vm = {};
    vm.addPatientCtrl = _addPatientCtrl;
    vm.addPatientCtrl.$inject = ['$scope', '$modalInstance', 'fullPatientList'];

    return {
      show: show,
      setPatientList: setPatientList
    };

    function setPatientList(patientList) {
      vm.fullPatientList = patientList;
    }

    function show(confirmCallback, cancelCallback) {
      var modalInstance = $modal.open({
        animation: true,
        templateUrl: 'views/addpatientmodal.html',
        controller: vm.addPatientCtrl,
        resolve: {
          fullPatientList: function () {
            return vm.fullPatientList;
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

    // Controller for the "Add Patient" modal
    function _addPatientCtrl($scope, $modalInstance, fullPatientList) {

      $scope.patientSearch = undefined;
      $scope.fullPatientList = fullPatientList;

      $scope.searchPatient = function (term) {
        var patientList = [];
        angular.forEach(fullPatientList, function (item) {
          if (item.patient.id.toUpperCase().indexOf(term.toUpperCase()) >= 0 || item.patient.name.toUpperCase().indexOf(term.toUpperCase()) >= 0) {
            patientList.push(item);
          }
        });
        $scope.patientList = patientList;
        return patientList;
      };

      $scope.selectPatient = function (item) {
        $scope.patient = item.patient;
        $scope.patientSearch = undefined;
      };

      $scope.ok = function () {
        $modalInstance.close($scope.patient);
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    }
  }
})();


