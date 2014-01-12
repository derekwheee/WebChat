define(['jquery', 'underscore', 'backbone'], function ($, _, Backbone) {

    var Router = Backbone.Router.extend({

        initialize : function() {

            Backbone.history.start();

        },

        routes: {
            '*path' : 'default'
        },

        default : function() {
            console.log('index.htmlol');
        }

    });

    var router = new Router();

});