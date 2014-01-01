exports.init = function(io) {
    return function (req, res) {
        var methods = {
                getTime : function () {
                    var time = new Date();
                    return time.getHours() + ':' + (time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes());
                }
            },
            clients = [];

        io.sockets.on('connection', function (socket) {

            clients.push(socket.id);

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
    };
};

exports.login = function (req, res) {

}