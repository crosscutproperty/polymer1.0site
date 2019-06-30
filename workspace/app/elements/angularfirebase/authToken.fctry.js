'use strict';

app.factory('authTokenFactory', ['authSvc',
  function (authSvc) {

    var authTokenFactory = {};

    authTokenFactory.login = function () {
      authSvc.login().then(function (authData) {
        authTokenFactory.authData = authData;
        console.log('aTF.aD: ' + authTokenFactory.authData);
      }).catch(function (error) {
        authTokenFactory.error = error;
      });
    };

    authTokenFactory.logout = function () {
      authSvc.logout();
      authTokenFactory.authData = null;
      authTokenFactory.error = null;
    };

    authTokenFactory.isLoggedIn = function () {
      return (typeof authTokenFactory.authData !== 'undefined')
        && authTokenFactory.authData !== null;
    };

    authTokenFactory.errorDuringLoggingIn = function () {
      return (typeof authTokenFactory.error !== 'undefined')
        && authTokenFactory.error !== null;
    };

    return authTokenFactory;
  }]);
