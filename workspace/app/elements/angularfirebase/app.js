'use strict';

var app = angular.module('firebaseApp', [
  'ngRoute',
  'firebase'
]);

// this is the Firebase URL we'll be talking to
// in case of your Firebase account, please modify
// the below URL appropriately
app.constant('FIREBASE_URI', 'https://society.firebaseio.com/');

app.config(function ($routeProvider) {
  
$routeProvider
    .when('/', {
      templateUrl: 'main/main.tpl.html',
      controller: 'MainCtrl as mainCtrl'
    })
    .when('/buildings', {
      templateUrl: 'building/building-view.tpl.html',
      controller: 'BuildingCtrl as buildingCtrl'
    })
    .when('/apartments', {
      templateUrl: 'apartment/apartment.tpl.html',
      controller: 'ApartmentCtrl as apartmentCtrl'
    })
    .when('/factsvc', {
      templateUrl: 'fact-svc/factSvc.tpl.html',
      controller: 'MyCtrl as myCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
});
