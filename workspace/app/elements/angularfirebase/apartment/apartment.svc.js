'use strict';

app.service('apartmentSvc', ['FIREBASE_URI', '$firebaseArray', 'buildingSvc',
  function (FIREBASE_URI, $firebaseArray, buildingSvc) {

    var apartmentsUri = FIREBASE_URI + 'apartments';
    var apartmentsRef = new Firebase(apartmentsUri);
    var apartments = $firebaseArray(apartmentsRef);

    var findAll = function () {
      return apartments;
    };

    var insertAndAddReferenceToBuilding = function (apartment) {
      apartments.$add(apartment).then(function (ref) {
        buildingSvc.addApartmentForCurrentBuilding(ref);
      })
    };

    var removeAndRemoveReferenceFromBuilding = function (apartmentRef) {
      var index = apartments.$indexFor(apartmentRef);
      apartments.$remove(index).then(function () {
        console.log('now remove apartment for building: ' + apartmentRef);
        buildingSvc.removeApartmentForCurrentBuilding(apartmentRef);
      }, function (error) {
        console.log('Error: ' + error);
      });
    };

    return {
      findAll: findAll,
      insertAndAddReferenceToBuilding: insertAndAddReferenceToBuilding,
      removeAndRemoveReferenceFromBuilding: removeAndRemoveReferenceFromBuilding
    }
  }]);