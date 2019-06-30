'use strict';

app.controller('ApartmentCtrl', ['$scope', 'apartmentSvc', 'buildingSvc',
  function ($scope, apartmentSvc, buildingSvc) {

    var vm = this;
    vm.currentBuilding = null;

    vm.apartment = new Apartment();
    vm.buildings = buildingSvc.findAll();

    vm.insertAndAddReferenceToBuilding = function () {
      apartmentSvc.insertAndAddReferenceToBuilding(angular.copy(vm.apartment));
      vm.apartment = new Apartment();
    };

    $scope.$watch(function () {
      return vm.currentBuilding;
    }, function () {
      buildingSvc.setCurrentBuilding(vm.currentBuilding);

      if (vm.currentBuilding) {
        vm.apartments = buildingSvc.getApartmentsForCurrentBuilding();
        vm.apartments.$loaded().then(function (data) {
          console.log('apt count: ' + data.length);
        });
      }
    });
  }
]);