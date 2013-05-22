$(function() {
 
    var messages   = [],
        socket     = io.connect('http://localhost:3700'),
        message    = $('#message'),
        sendButton = $('#send'),
        content    = $('.chat-container'),
        name       = $('#name');
 
    socket.on('message', function (data) {
        if(data.message) {
            messages.push(data);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                html = html + '<strong>' + (messages[i].username ? messages[i].username : 'Server') + ': </strong>' +
                        messages[i].message + '<br />';
            }
            content.html(html);
            content.scrollTop = content.scrollHeight;
        } else {
            console.log('There is a problem:', data);
        }
    });
 
    sendButton.on('click', function() {
        if(!name.val() || !message.val()) {
            alert('Make sure you entered your name and a message');
        } else {
            var text = message.val();
            socket.emit('send', { message: text, username: name.val() });
            message.val('');
        }
    });

    message.keyup(function(event){
        if(event.keyCode == 13){
            sendButton.trigger('click');
        }
    });
 
});