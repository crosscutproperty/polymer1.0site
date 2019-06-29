app.directive('apartment', ['FIREBASE_URI', '$firebaseObject', 'apartmentSvc',
  function (FIREBASE_URI, $firebaseObject, apartmentSvc) {

    var linker = function (scope, element, attrs) {
      scope.apartmentRef = attrs['apartmentRef'];
      scope.myApartment = $firebaseObject(new Firebase(FIREBASE_URI + 'apartments/' + scope.apartmentRef));
    };

    var controller = function ($scope) {
      $scope.updateItem = function () {
        $scope.myApartment.$save();
      };

      $scope.removeItem = function () {
        apartmentSvc.removeAndRemoveReferenceFromBuilding($scope.apartmentRef);
      };
    };

    return {
      scope: true,
      link: linker,
      controller: controller
    };
  }]);