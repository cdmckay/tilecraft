define([
    "jquery",
    "backbone",
    "tmxjs/map",
    "tmxjs/tile-layer"
], function (
    $,
    Backbone,
    Map,
    TileLayer
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
        },
        render: function () {
        },

        toggle: function (event) {
            var up = this.$el.hasClass("up");
            this.$el.toggleClass("up").animate({ top: up ? -1 : -34 });
        },
        newMap: function (event) {
            if (confirm("Are you sure you want to create a new map?")) {
                var map = this.model.get("map");
                var newMap = new Map(
                    Map.Orientation.ORTHOGONAL,
                    map.bounds.w,
                    map.bounds.h,
                    map.tileInfo.w,
                    map.tileInfo.h
                );
                var layer = new TileLayer("Tile Layer 1", newMap.bounds.clone());
                newMap.addLayer(layer);
                this.model.set("map", newMap);
            }
        },
        downloadMap: function (event) {
            var view = this;
            this.model.save()
                .done(function (response) {
                    if (response.successful) {
                        location.href = 'endpoint.php?r=map/' + view.model.id + '/download';
                    } else {
                        alert(response.message + ".");
                    }
                })
                .fail(function () {
                    alert("Failed to save map.");
                });
        }
    });
});