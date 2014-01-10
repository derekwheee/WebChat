$(function() {

    var CHAT = {

        socket        : io.connect('http://localhost:3700'),
        notify        : {},
        notification  : null,
        Notifications : window.Notifications || window.webkitNotifications || window.mozNotifications,
        $name         : $('#name'),
        $message      : $('#message'),
        $send         : $('#send'),
        $notify       : $('#notify'),
        $container    : $('.chat-container'),
        $users        : $('.users'),
        currentUser   : {
            id      : null,
            name    : null,
            session : null
        },

        init : function () {

            var _this = CHAT;

            // Get permission for notifications
            if (_this.Notifications) {
                _this.methods.checkNotificationPermissions();
            }
            else {
                _this.$notify.remove();
            }

            // Initialize events
            _this.events();

        },

        events : function () {

            var _this = CHAT;

            _this.socket.on('user', _this.methods.updateUserList);

            _this.socket.on('typing', _this.methods.updateTypingStatus);

            _this.socket.on('message', _this.methods.appendMessages);

            _this.$send.on('click', _this.methods.sendMessage);

            _this.$message.keyup(function(event){
                if(event.keyCode == 13){
                    _this.$send.trigger('click');
                }
            });

            _this.$message.keyup(function(event) {
                if (event.keyCode !== 13) {
                    _this.methods.sendTyping();
                }
            });

        },

        methods : {

            checkNotificationPermissions : function () {
                if (CHAT.Notifications.checkPermission() === 0) {
                    CHAT.$notify.remove();
                }
                $('#notify, #send').on('click', function () {
                    if (CHAT.Notifications.checkPermission() === 0) { // 0 is PERMISSION_ALLOWED
                        CHAT.$notify.remove();
                    } else {
                        CHAT.Notifications.requestPermission();
                    }
                });
            },

            updateUserList : function (users) {
                var user      = null,
                    userClass = '',
                    sessionId = CHAT.socket.socket.sessionid,
                    _this;

                CHAT.$users.empty();

                for (user in users) {
                    _this = users[user];

                    if (_this.id === sessionId) {
                        userClass = 'current-user';
                        CHAT.$name.val(_this.name).prop('disabled', true);
                        CHAT.currentUser = {
                            id      : _this.id,
                            name    : _this.name,
                            session : sessionId
                        }
                    } else {
                        userClass = '';
                    }

                    CHAT.$users.append('<div class="' + userClass + '" data-id="' + _this.id + '">' + _this.name + '<i class="fa fa-keyboard-o typing"></i><br /><small>' + _this.ip + '</small></div>');
                }
            },

            appendMessages : function (data) {
                if (data.hasOwnProperty('message')) {
                    var message = CHAT.methods.renderMessage(data.message);

                    CHAT.$container.append('<div><strong>' + data.username + '</strong>' + message + '<time>' + data.timestamp + '</time></div>');

                    CHAT.notify.title = data.username + ' says...';
                    CHAT.notify.body = message;

                    CHAT.$container.scrollTop(CHAT.$container[0].scrollHeight);

                    if (CHAT.Notifications && CHAT.notification && !document.hasFocus()) {
                        CHAT.notification = CHAT.Notifications.createNotification('https://scontent-a-lga.xx.fbcdn.net/hphotos-ash2/562136_10150670320458279_1124901033_n.jpg', CHAT.notify.title, CHAT.notify.body);
                        CHAT.notification.onclick = function(x) { window.focus(); this.cancel(); };
                        CHAT.notification.show();

                        notifyCancel = setTimeout(function() {
                            CHAT.notification.cancel();
                        }, 3000);
                    }

                }

                if ($.isArray(data)) {
                    var message;

                    $(data).each(function () {
                        message = CHAT.methods.renderMessage(this.message);
                        CHAT.$container.append('<div><strong>' + this.username + '</strong>' + message + '<time>' + this.timestamp + '</time></div>');
                    });
                }
            },

            sendMessage : function () {
                if(!CHAT.$name.val() || !CHAT.$message.val()) {
                    alert('Make sure you entered your name and a message');
                } else {
                    var text     = CHAT.$message.val().replace(/</g, '&lt;'),
                        user     = CHAT.$name.val();

                    CHAT.socket.emit('send', {
                        message   : text,
                        username  : user
                    });

                    CHAT.$message.val('');
                }
            },

            renderMessage : function (message) {
                var text       = message.split(' '),
                    imgRegex   = new RegExp(/\b[A-Za-z0-9:_\/\.\-\+]+(\.gif|\.jpg|\.png)$\b/g),
                    urlRegex   = new RegExp(/\b(^http|www)+[A-Za-z0-9\/\.:]+(?!\.gif|\.jpg|\.png)$\b/g),
                    emoteRegex = new RegExp(/^((&lt;)|[>:;=8bd])+-?([()\[\]\/\\\|bdop3\{\}:><]|(&lt;))$/i),
                    newArr     = [],
                    tmpStr     = '';

                $(text).each(function() {
                    tmp = this;
                    tmp = tmp.replace(imgRegex, '<img src="$&" />');
                    tmp = tmp.replace(urlRegex, '<a href="$&" target="_blank">$&</a>');
                    tmp = tmp.replace(emoteRegex, '<span class="emote">$&</span>');
                    newArr.push(tmp);
                });

                return newArr.join(' ');
            },

            sendTyping : function () {
                if (!CHAT.typingTimer) {
                    CHAT.socket.emit('typing', {
                        typing : true,
                        user   : CHAT.currentUser
                    });
                }

                clearTimeout(CHAT.typingTimer);
                CHAT.typingTimer = setTimeout(function () {
                    CHAT.socket.emit('typing', {
                        typing : false,
                        user   : CHAT.currentUser
                    });
                    CHAT.typingTimer = null;
                }, 500);
            },

            updateTypingStatus : function (data) {
                var $user = CHAT.$users.find('div[data-id=' + data.user.id + ']'),
                    $icon = $user.find('i.typing');

                if (data.typing) {
                    $icon.show();
                } else {
                    $icon.hide();
                }
            }

        }
    };

    CHAT.init();

});