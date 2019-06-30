app.directive("createBuilding", function () {
  return {
    restrict: 'E',
    transclude: true,
    scope: {
      building: '=',
      "insert": '&onSubmit'
    },
    templateUrl: 'building/create-building.tpl.html'
  };
});