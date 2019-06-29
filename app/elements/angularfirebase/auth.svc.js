'use strict';

app.service('authSvc', ['FIREBASE_URI', '$firebaseAuth',
  function (FIREBASE_URI, $firebaseAuth) {

    var ref = new Firebase(FIREBASE_URI);
    var auth = $firebaseAuth(ref);

    var login = function () {
      /*auth.$authWithOAuthPopup("facebook").then(function(authData) {
        console.log("Logged in as:", authData.uid);
      }).catch(function(error) {
        console.log("Authentication failed:", error);
      });*/
      return auth.$authWithOAuthPopup("facebook"); //auth.$authAnonymously();
    };

    var logout = function () {
      return auth.$unauth();
    };

    return {
      login: login,
      logout: logout
    }
  }]);
