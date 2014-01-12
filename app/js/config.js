requirejs.config({
    
    deps : ['app/main'],
    
    paths: {
        // dependencies
        jquery               : '/vendor/jquery',
        underscore           : '/vendor/underscore',
        backbone             : '/vendor/backbone',
        // plugins
        mustache             : '/vendor/mustache',
        text                 : '/vendor/text'
        // libs

    },
    shim: {
        underscore : {
            exports : '_'
        },
        backbone : {
            deps : ['underscore', 'jquery'],
            exports : 'Backbone'
        }
    }

});