'use strict';

app.controller('BuildingCtrl', ['buildingSvc',
  function (buildingSvc) {

    var vm = this;
    vm.building = new Building();

    vm.buildings = buildingSvc.findAll();

    vm.insert = function () {
      buildingSvc.insert(angular.copy(vm.building));
      vm.building = new Building();
    };

    vm.update = function (id) {
      buildingSvc.update(id);
    };

    vm.remove = function (id) {
      buildingSvc.remove(id);
    };
  }
]);