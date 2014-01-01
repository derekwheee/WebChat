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

    socket.on('user', function(data) {
        $('.users').empty();
        $(data).each(function() {
            console.log(this.name);
            $('.users').append('<div>' + this.name + '<br /><small>' + this.ip.address + '</small></div>');
        });
    });

    socket.on('message', function (data) {
        if(data.message) {

            content.append('<div><strong>' + data.username + '</strong>' + data.message + '<time>' + data.timestamp + '</time></div>');

            notify.title = data.username + ' says...';
            notify.body = data.message;

            content.scrollTop(content[0].scrollHeight);

            if (Notifications && notification) {
                notification = Notifications.createNotification('https://scontent-a-lga.xx.fbcdn.net/hphotos-ash2/562136_10150670320458279_1124901033_n.jpg', notify.title, notify.body);
				notification.onclick = function(x) { window.focus(); this.cancel(); };
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
            var text     = message.val().replace(/</g, '&lt;').split(' '),
				user     = name.val(),
                time     = new Date(),
				imgRegex = new RegExp(/\b[A-Za-z0-9\/\.:]+(\.gif|\.jpg|\.png)$\b/g),
				urlRegex = new RegExp(/\b(^http)+[A-Za-z0-9\/\.:]+(?!\.gif|\.jpg|\.png)$\b/g),
				newArr   = [],
				tmpStr   = '';

			$(text).each(function() {
				tmp = this;
				tmp = tmp.replace(imgRegex, '<img src="$&" />');
				tmp = tmp.replace(urlRegex, '<a href="$&">$&</a>');
				newArr.push(tmp);
			});

			text = newArr.join(' ');

            socket.emit('send', {
                message   : text,
                username  : user
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
