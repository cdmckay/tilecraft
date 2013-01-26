require.config({
    paths: {
        "underscore": "lib/underscore",
        "backbone": "lib/backbone",
        "handlebars": "lib/handlebars",
        "jquery": "lib/jquery",
        "tmxjs": "lib/tmxjs",
        "gunzip": "lib/gunzip.min",
        "inflate": "lib/inflate.min"
    },
    shim: {
        "underscore": { exports: "_" },
        "backbone": { exports: "Backbone", deps: ["underscore"] },
        "handlebars": { exports: "Handlebars" },
        "gunzip": { exports: "Zlib.Gunzip" },
        "inflate": { exports: "Zlib.Inflate" }
    }
});

require([
    "backbone",
    "handlebars",
    "gunzip",
    "inflate",
    "jquery",
    "underscore",
    "tmxjs/map",
    "tmxjs/tile-layer",
    "tmxjs/util/string-util"
], function (
    Backbone,
    Handlebars,
    Gunzip,
    Inflate,
    $,
    _,
    Map,
    TileLayer,
    StringUtil
) {
    var mapWidth = 40;
    var mapHeight = 40;
    var mapTileWidth = 32;
    var mapTileHeight = 32;

    var map = new Map("orthogonal", mapWidth, mapHeight, mapTileWidth, mapTileHeight);

    var MapModel = Backbone.Model.extend({
        addLayer: function(layer) {
            var map = this.get("map");
            map.addLayer(layer);
            this.set("map", map);
            this.trigger("layer:add");
        }
    });
    var mapModel = new MapModel();
    mapModel.set("map", map);

    var LayerManagerView = Backbone.View.extend({
        events: {
            "click .layer-manager-toolbar-add-button": "addLayer"
        },
        initialize: function () {
            this.listenTo(this.model, "layer:add", this.render);
        },
        render: function () {
            var layers = this.model.get("map").layers;
            var layersList = this.$(".layer-manager-layers");
            layersList.empty();
            _.each(layers, function () {
               layersList.append('<li><label><input type="checkbox" /> <span>Test <em>(Tiles)</em></span></label></li>');
            });
            return this;
        },
        addLayer: function () {
            this.model.addLayer(new TileLayer(map));
        }
    });
    var layerManagerView = new LayerManagerView({
        el: $("#layer-manager"),
        model: mapModel
    });

    mapModel.addLayer(new TileLayer(map));
});