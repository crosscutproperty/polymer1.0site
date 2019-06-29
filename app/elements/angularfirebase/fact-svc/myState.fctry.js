'use strict';

app.factory('myFactoryWithState', function() {
    return function(name) {
        this.name = name;

        this.hello = function() {
            return "Hello " + this.name;
        };
    };
});
