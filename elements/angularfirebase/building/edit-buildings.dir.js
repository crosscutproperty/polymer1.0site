app.directive("editBuildings", function () {
  return {
    restrict: 'E',
    transclude: true,
    scope: {
      buildings: '=',
      "update": '&onEdit',
      "remove": '&onDelete'
    },
    templateUrl: 'building/edit-building.tpl.html'
  };
});
