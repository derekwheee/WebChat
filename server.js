var express = require("express"),
    app = express(),
    port = 3700;

app.use(express.static(__dirname + '/'));

var io = require('socket.io').listen(app.listen(port));

io.sockets.on('connection', function (socket) {
    socket.emit('message', { message: 'Welcome.' });
    socket.on('send', function (data) {
        io.sockets.emit('message', data);
    });
});

console.log("Listening on port " + port);