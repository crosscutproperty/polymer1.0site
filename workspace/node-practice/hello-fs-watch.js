var fs = require("fs");
var fileName = "testfile.txt";
fs.watch(fileName, {
  persistent: true
},function(event, filename){
  console.log(event+" event occured on "+filename);
});
