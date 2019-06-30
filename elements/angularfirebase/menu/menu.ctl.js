'use strict';

app.controller('MenuCtrl', ['authTokenFactory',
  function (authTokenFactory) {

    this.isLoggedIn = function () {
      return authTokenFactory.isLoggedIn();
    };

    this.errorDuringLoggingIn = function () {
      return authTokenFactory.errorDuringLoggingIn();
    };
  }
]);