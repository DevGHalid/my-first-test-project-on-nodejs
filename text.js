const fs = require("fs");

fs.readdir("../Desktop", function(err, data) {
    console.log(data.length);
});