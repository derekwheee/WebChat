var express = require('express');
    chat    = require('./chat');

exports.init = function(app, settings) {
    // API globals
    app.all('/api/*', function(req, res, next) {
        // Set some headers so AJAX doesn't get fussy
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With');

        if (req.user) {
            next();
        } else {
            res.json({
                "status" : "error",
                "error"  : "Unauthenticated User"
            }, 401)
        }
    });

    // Auth globals
    app.all('/auth/*', function(req, res, next) {
        // Set some headers so AJAX doesn't get fussy
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With');
        next();
    });

    // Basic routes
    app.get('/chat', chat.init);

    // Serve static files
    app.use(express.static(settings.app));
}