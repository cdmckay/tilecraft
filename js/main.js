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
    "jquery",
    "underscore",
    "backbone",
    "handlebars",
    "gunzip",
    "inflate",
    "./models/map-model",
    "./views/layer-manager-view",
    "tmxjs/map"
], function (
    $,
    _,
    Backbone,
    Handlebars,
    Gunzip,
    Inflate,
    MapModel,
    LayerManagerView,
    Map
) {
    var mapWidth = 40;
    var mapHeight = 40;
    var mapTileWidth = 32;
    var mapTileHeight = 32;

    var map = new Map("orthogonal", mapWidth, mapHeight, mapTileWidth, mapTileHeight);

    var mapModel = new MapModel();
    mapModel.set("map", map);

    var layerManagerView = new LayerManagerView({
        el: "#layer-manager",
        model: mapModel
    });
    layerManagerView.addDoodadGroup();
});