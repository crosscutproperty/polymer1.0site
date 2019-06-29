'use strict';

app.service('buildingSvc', ['FIREBASE_URI', '$firebaseArray',
  function (FIREBASE_URI, $firebaseArray) {

    var buildingsUri = FIREBASE_URI + 'buildings';
    var buildingsRef = new Firebase(buildingsUri);
    var buildings = $firebaseArray(buildingsRef);

    var currentBuilding = null;

    var findAll = function () {
      return buildings;
    };

    var setCurrentBuilding = function (building) {
      currentBuilding = building;
    };

    var getApartmentsForCurrentBuilding = function () {
      var apartmentsRef = buildingsRef.child(currentBuilding + '/apartments');
      return $firebaseArray(apartmentsRef);
    };

    var addApartmentForCurrentBuilding = function (apartmentRef) {
      var child = buildingsRef.child(currentBuilding + '/apartments/' + apartmentRef.key());
      child.set(true);
    };

    var removeApartmentForCurrentBuilding = function (apartmentRef) {
      var child = buildingsRef.child(currentBuilding + '/apartments/' + apartmentRef);
      child.remove();
    };

    var insert = function (item) {
      buildings.$add(item);
    };

    var update = function (id) {
      buildings.$save(id);
    };

    var remove = function (id) {
      buildings.$remove(id);
    };

    return {
      findAll: findAll,
      insert: insert,
      update: update,
      remove: remove,
      setCurrentBuilding: setCurrentBuilding,
      addApartmentForCurrentBuilding: addApartmentForCurrentBuilding,
      removeApartmentForCurrentBuilding: removeApartmentForCurrentBuilding,
      getApartmentsForCurrentBuilding: getApartmentsForCurrentBuilding
    }
  }]);