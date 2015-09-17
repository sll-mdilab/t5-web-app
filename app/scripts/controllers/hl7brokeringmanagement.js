/**
 * @ngdoc function
 * @name fhirWebApp.controller:HL7BrokeringManagementCtrl
 * @description
 * # HL7BrokeringManagementCtrl
 * Controller of the fhirWebApp
 */
(function () {
  'use strict';
  angular
    .module('fhirWebApp')
    .controller('HL7BrokeringManagementCtrl', HL7BrokeringManagementCtrl);

  HL7BrokeringManagementCtrl.$inject = ['$modal', 'fhirBrokeringReceiver', 'confirmModalFactory'];

  function HL7BrokeringManagementCtrl($modal, fhirBrokeringReceiver, confirmModalFactory) {
    var vm = this;
    vm.receivers = [];
    vm.gridOptions = {};
    vm.getGridHeight = getGridHeight;
    vm.addReceiver = addReceiver;
    vm.askToDeleteReceiver = askToDeleteReceiver;
    vm.deleteReceiver = deleteReceiver;
    vm.editReceiver = editReceiver;
    vm.newReceiver = undefined;
    vm.confirmDeletion = false;
    vm.showSpinner = false;
    vm.dim = {
      systemName: 45,
      address: 30,
      port: 15,
      delete: 10
    };

    setupGridOptions();
    init();

    function init() {
      updateReceiverList();
    }

    function updateReceiverList() {
      vm.showSpinner = true;
      fhirBrokeringReceiver.getAllReceivers().then(function (receivers) {
        vm.receivers = receivers;
        vm.gridOptions.data = vm.receivers;
        focusInput();
        vm.showSpinner = false;
      });
    }

    function focusInput() {
      angular.element('input')[0].focus();
    }

    function setupGridOptions() {
      vm.gridOptions.onRegisterApi = function (gridApi) {
        vm.gridApi = gridApi;
      };
      vm.gridOptions.rowHeight = 30;
      vm.gridOptions.footerHeight = 30;
      vm.gridOptions.headerHeight = 30;
      vm.gridOptions.enableCellEditOnFocus = true;
      //@formatter:off
      var editTemplate =
        '<div class="text-center ui-grid-cell-contents">' +
          '<div class="btn-group">' +
            '<button type="button" class="btn btn-primary btn-xs" aria-label="Left Align" ng-click="grid.appScope.vm.editReceiver(grid, row)">' +
              '<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>' +
            '</button>' +
            '<button type="button" class="btn btn-danger btn-xs" aria-label="Left Align" ng-click="grid.appScope.vm.askToDeleteReceiver(grid, row)">' +
              '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>' +
            '</button>' +
          '</div>'+
        '</div>';
      //@formatter:on
      vm.gridOptions.columnDefs = [
        {name: 'systemName', enableCellEditOnFocus: true, displayName: 'Systemnamn', width: vm.dim.systemName + '%'},
        {name: 'address', enableCellEditOnFocus: true, displayName: 'Adress', width: vm.dim.address + '%'},
        {name: 'port', enableCellEditOnFocus: true, displayName: 'Port', width: vm.dim.port + '%'},
        {field: 'id', displayName: '', cellTemplate: editTemplate, width: vm.dim.delete + '%'}
      ];
    }

    function getGridHeight() {
      return vm.gridOptions.headerHeight + vm.gridOptions.data.length * vm.gridOptions.rowHeight;
    }

    function addReceiver() {
      vm.showSpinner = true;
      fhirBrokeringReceiver.createReceiver(vm.newReceiver).then(function () {
        vm.newReceiver = undefined;
        vm.showSpinner = false;
        updateReceiverList();
      });
    }

    function editReceiver(grid, row) {
      var modalInstance = $modal.open({
        templateUrl: 'views/editbrokeringreceivermodal.html',
        controller: ['$modalInstance', 'grid', 'row', RowEditCtrl],
        controllerAs: 'vm',
        resolve: {
          grid: function () {
            return grid;
          },
          row: function () {
            return row;
          }
        }
      });
      modalInstance.result.then(function (receiver) {
        vm.showSpinner = true;
        fhirBrokeringReceiver.editReceiver(receiver).then(function () {
          vm.showSpinner = false;
          updateReceiverList();
        });
      });
    }

    function RowEditCtrl($modalInstance, grid, row) {
      var vm = this;

      vm.entity = angular.copy(row.entity);

      vm.grid = grid;
      vm.row = row;
      vm.save = save;
      vm.cancel = cancel;

      function save() {
        // Copy row values over
        row.entity = angular.extend(row.entity, vm.entity);
        $modalInstance.close(row.entity);
      }

      function cancel() {
        $modalInstance.dismiss('cancel');
      }
    }

    function askToDeleteReceiver(grid, row) {
      var title = 'Bekräfta borttagning';
      var msg = 'Är du säker på att du vill ta bort \'' + row.entity.systemName + '\' som mottagare av HL7v2 meddelande?';
      confirmModalFactory.show(title, msg, deleteReceiver(row.entity));
    }

    function deleteReceiver(receiver) {
      return function () {
        vm.showSpinner = true;
        return fhirBrokeringReceiver.deleteReceiver(receiver).then(function () {
          vm.showSpinner = false;
          updateReceiverList();
        });
      };
    }
  }
})();


