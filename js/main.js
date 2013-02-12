require.config({
    paths: {
        "jquery": "lib/jquery",
        "jquery-colorbox": "lib/jquery.colorbox",
        "jquery-validate": "lib/jquery.validate",
        "underscore": "lib/underscore",
        "backbone": "lib/backbone",
        "handlebars": "lib/handlebars",
        "tmxjs": "lib/tmxjs",
        "gunzip": "lib/gunzip.min",
        "inflate": "lib/inflate.min"
    },
    shim: {
        "jquery-colorbox": { deps: ["jquery"] },
        "jquery-validate": { deps: ["jquery"] },
        "underscore": { exports: "_" },
        "backbone": { exports: "Backbone", deps: ["underscore"] },
        "handlebars": { exports: "Handlebars" },
        "gunzip": { exports: "Zlib.Gunzip" },
        "inflate": { exports: "Zlib.Inflate" }
    }
});

require([
    "jquery",
    "jquery-colorbox",
    "jquery-validate",
    "underscore",
    "backbone",
    "handlebars",
    "gunzip",
    "inflate",
    "tmxjs/map",
    "./models/map-model",
    "./models/tile-set-model",
    "./views/layer-manager-view",
    "./views/tile-set-editor-view",
    "./views/tile-set-manager-view"
], function (
    $,
    $colorbox,
    $validate,
    _,
    Backbone,
    Handlebars,
    Gunzip,
    Inflate,
    Map,
    MapModel,
    TileSetModel,
    LayerManagerView,
    TileSetEditorView,
    TileSetManagerView
) {
    var mapWidth = 40;
    var mapHeight = 40;
    var mapTileWidth = 32;
    var mapTileHeight = 32;

    var map = new Map("orthogonal", mapWidth, mapHeight, mapTileWidth, mapTileHeight);

    var mapModel = new MapModel({
        map: map
    });

    // Layer Manager

    var layerManagerView = new LayerManagerView({
        el: "#layer-manager",
        model: mapModel
    });
    layerManagerView.addTileLayer();

    // Tile Set Manager

    var tileSetManagerView = new TileSetManagerView({
        el: "#tile-set-manager",
        model: mapModel
    });
});