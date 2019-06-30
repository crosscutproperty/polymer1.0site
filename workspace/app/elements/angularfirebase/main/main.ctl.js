'use strict';

app.controller('MainCtrl', ['$scope', 'authTokenFactory',
  function ($scope, authTokenFactory) {

    $scope.isLoggedIn = function () {
      return authTokenFactory.isLoggedIn();
    };

    $scope.errorDuringLoggingIn = function () {
      return authTokenFactory.errorDuringLoggingIn();
    };

    $scope.login = function() {
      authTokenFactory.login();

      $scope.$watch(function () {
        return authTokenFactory.authData;
      }, function () {
        $scope.authData = authTokenFactory.authData;
      });

      $scope.$watch(function () {
        return authTokenFactory.error;
      }, function () {
        $scope.error = authTokenFactory.error;
      });
    };

    $scope.logout = function () {
      authTokenFactory.logout();
      $scope.authData = null;
    };
  }
]);