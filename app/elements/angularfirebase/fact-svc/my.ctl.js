'use strict';

app.controller('MyCtrl', function(myService, myFactory, myFactoryWithState) {

  var vm = this;

  var init = function() {
    vm.fromService = myService.hello(); //'Hello World'
    vm.fromFactory = myFactory.hello(); //'Hello World'
    vm.fromFactoryWithData = new myFactoryWithState('State').hello(); //'Hello State'
  };

  init();
});
