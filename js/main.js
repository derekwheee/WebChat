$(function() {
 
    var messages   = [],
        socket     = io.connect('http://localhost:3700'),
        message    = $('#message'),
        sendButton = $('#send'),
        content    = $('.chat-container'),
        name       = $('#name'),
        ogTitle    = document.title,
        notify     = {
            title : 'Web Chat',
            body  : 'There are new messages waiting for you.'
        },
        notification;

    // check for notifications support
    // you can omit the 'window' keyword
    var Notifications =  window.Notifications || window.webkitNotifications || window.mozNotifications;
    if (Notifications) {
        if (Notifications.checkPermission() === 0) {
            $('#notify').remove();
        }
        $('#notify, #send').on('click', function () {
            if (Notifications.checkPermission() === 0) { // 0 is PERMISSION_ALLOWED
                notification = Notifications.createNotification('icon.png', notify.title, notify.body);

                notifyCancel = setTimeout(function() {
                    notification.cancel();
                }, 3000);

                $('#notify').remove();
            } else {
                Notifications.requestPermission();
            }
        });
    }
    else {
        $('#notify').remove();
    }
 
    socket.on('message', function (data) {
        if(data.message) {
            messages.push(data);
            var html = '',
                time, timestamp, username;

            for(var i=0; i<messages.length; i++) {
                username  = messages[i].username ? messages[i].username : 'no one'
                time      = messages[i].timestamp || new Date();
                timestamp = messages[i].timestamp || time.getHours() + ':' + time.getMinutes();
                html      = html + '<div><strong>' + username + '</strong> ' +
                            messages[i].message + '<time>' + timestamp + '</time></div>';

                notify.title = username + ' says...';
                notify.body = messages[i].message; 
            }

            content.html(html);
            content.scrollTop(content[0].scrollHeight);

            if (Notifications && notification) {
                notification = Notifications.createNotification('https://scontent-a-lga.xx.fbcdn.net/hphotos-ash2/562136_10150670320458279_1124901033_n.jpg', notify.title, notify.body);
                notification.show();
            }

        } else {
            console.log('There is a problem:', data);
        }
    });
 
    sendButton.on('click', function() {
        if(!name.val() || !message.val()) {
            alert('Make sure you entered your name and a message');
        } else {
            var text = message.val(),
                time = new Date();

            if (text === 'refresh') {
                text = '<script>window.location.reload(true)</script>';
            } else {
                text = text.replace(/</g, '&lt;');
            }

            socket.emit('send', {
                message   : text,
                username  : name.val(),
                timestamp : time.getHours() + ':' + time.getMinutes()
            });
            message.val('');
        }
    });

    message.keyup(function(event){
        if(event.keyCode == 13){
            sendButton.trigger('click');
        }
    });
 
});