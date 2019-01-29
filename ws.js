const WebSocket = require("ws");
const fs = require("fs");
const dataFiles = {};

const server = new WebSocket.Server({
    port: 8081
})

function empty(n) {
    return !n;
}

server.on("connection", ws => {
    ws.on("message", response => {
        response = JSON.parse(response);
        console.log(response);

        fs.readdir(response.default, (err, dataFileChild) => {
            dataFileChild = dataFileChild.filter(read => {
                return read[0] !== ".";
            });

            ws.send(JSON.stringify({dataFileChild}));   
        })
    });

    ws.on('close', (err) => {
        console.log("Error ws server");
    });
});


console.log("Start server project")

