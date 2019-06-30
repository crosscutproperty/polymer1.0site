var fs = require("fs");
fs.readFile("testfile.txt","utf8", function(error, data){
    console.log(data);
});
