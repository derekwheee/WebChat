var express = require('express'),
    http    = require('http'),
    app     = express(),
    server  = http.createServer(app),
    io      = require('socket.io').listen(server),
    port    = 3700;

app.use(express.static(__dirname + '/'));

var users = [
        {
            address : '0.0.0.0',
            name    : 'Nobody'
        },
        {
            address : '1.1.1.1',
            name    : 'Also Nobody'
        },
        {
            address : '192.168.1.140',
            name    : 'Macbook'
        },
        {
            address : '192.168.1.130',
            name    : 'iPhone'
        },
        {
            address : '192.168.1.145',
            name    : 'Mac Mini'
        }
    ],
    methods = {
        getTime : function () {
            var time    = new Date(),
                hours   = time.getHours() <= 12 ? time.getHours() : Math.abs(time.getHours() - 12),
                minutes = time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes(),
                ampm    = time.getHours() <= 12 ? 'am' : 'pm';

            return hours + ':' + minutes + ampm;
        },
        getUsername : function (address) {
            var user = users.filter(function(user) {
                return user.address === address.address;
            });

            return user[0] ? user[0].name : 'Phantom Chatter';
        }
    },
    clients = [],
    user;

io.sockets.on('connection', function (socket) {

    user  = socket.id;

    clients.push({
        "id"   : socket.id,
        "ip"   : socket.handshake.address,
        "name" : methods.getUsername(socket.handshake.address)
    });

    socket.send(user);

    socket.emit('user', clients);
    socket.broadcast.emit('user', clients);

    socket.emit('message', {
        username  : 'No One',
        message   : 'Welcome.',
        timestamp : methods.getTime()
    });

    socket.on('send', function (data) {
        var message = data.message === 'refresh' ? '<script>window.location.reload(true)</script>' : data.message.replace('/</g', '&lt;');

        io.sockets.emit('message', {
            username  : data.username,
            message   : message,
            timestamp : methods.getTime()
        });
    });

    socket.on('disconnect', function () {
        clients.splice(clients.indexOf(socket.id), 1);
        socket.broadcast.emit('user', clients);
    });
});

server.listen(port);
console.log("Listening on port " + port);