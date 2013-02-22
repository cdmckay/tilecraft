define([
    "jquery",
    "backbone"
], function (
    $,
    Backbone
    ) {
    return Backbone.View.extend({
        events: {
            "mousedown #main-menu-toggle": "toggle",
            "click .main-menu-new-button": "newMap",
            "click .main-menu-download-button": "downloadMap"
        },

        aggregator: null,
        templates: {},

        initialize: function (options) {
            this.aggregator = options.aggregator;

            this.toggleEl = this.$("#main-menu-toggle");
        },
        render: function () {
        },

        toggle: function (event) {
            var up = this.$el.hasClass("up");
            this.$el.toggleClass("up").animate({ top: up ? -1 : -34 });
        },
        newMap: function () {
            alert("New Map!");
        },
        downloadMap: function () {
            alert("Download Map!");
        }
    });
});