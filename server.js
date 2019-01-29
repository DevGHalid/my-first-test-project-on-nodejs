const http = require("http");
const fs = require("fs");
const path = require("path");

http.createServer((req, res) => {

    if ( req.url === "/" ) {
        fs.readFile(__dirname + "/app/index.html", "utf8", (err, data) => {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
        });
    }
    else if (req.url.match("\.css$")) {
        const cssPath = path.join(__dirname, "app", req.url);
        const readFileCss = fs.createReadStream(cssPath, "utf8");

        res.writeHead(200, { "Content-Type": "text/css" })
        readFileCss.pipe(res);
    }

    else if (req.url.match("\.js$")) {
        const jsPath = path.join(__dirname, "app", req.url);
        const readFileJs = fs.createReadStream(jsPath, "utf8");

        res.writeHead(200, {"Content-Type": "text/js"});
        readFileJs.pipe(res);
    }

    else if (req.url.match("\.png$")) {
        const pngPath = path.join(__dirname, "app", req.url);
        const readFilePng = fs.createReadStream(pngPath);

        res.writeHead(200, {"Content-Type": "Image/png"});
        readFilePng.pipe(res);
    }

    else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end();
    }

}).listen(8080);

console.log("Start server");

