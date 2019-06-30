'use strict';

app.factory('myFactory', function(){
    return {
        hello: function() {
            return "Hello World";
        }
    }
});
