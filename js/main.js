require.config({
    paths: {
        "jquery": "lib/jquery",
        "jquery-colorbox": "lib/jquery.colorbox",
        "jquery-validate": "lib/jquery.validate",
        "underscore": "lib/underscore",
        "backbone": "lib/backbone",
        "handlebars": "lib/handlebars",
        "tmxjs": "lib/tmxjs",
        "zlib": "lib/zlib.min"
    },
    shim: {
        "jquery-colorbox": { deps: ["jquery"] },
        "jquery-validate": { deps: ["jquery"] },
        "underscore": { exports: "_" },
        "backbone": { exports: "Backbone", deps: ["underscore"] },
        "handlebars": { exports: "Handlebars" },
        "zlib": { exports: "Zlib" }
    }
});

require([
    "jquery",
    "jquery-colorbox",
    "jquery-validate",
    "underscore",
    "backbone",
    "handlebars",
    "tmxjs/map",
    "tmxjs/tile-layer",
    "tmxjs/tile-set",
    "./models/map-model",
    "./models/tile-set-model",
    "./views/layer-manager-view",
    "./views/main-menu-view",
    "./views/map-editor-view",
    "./views/tile-set-editor-view",
    "./views/tile-set-manager-view"
], function (
    $,
    $colorbox,
    $validate,
    _,
    Backbone,
    Handlebars,
    Map,
    TileLayer,
    TileSet,
    MapModel,
    TileSetModel,
    LayerManagerView,
    MainMenuView,
    MapEditorView,
    TileSetEditorView,
    TileSetManagerView
) {
    var mapWidth = 40;
    var mapHeight = 40;
    var mapTileWidth = 32;
    var mapTileHeight = 32;

    var map = new Map(
        Map.Orientation.ORTHOGONAL,
        mapWidth,
        mapHeight,
        mapTileWidth,
        mapTileHeight
    );

    var layer = new TileLayer("Tile Layer 1", map.bounds.clone());
    map.addLayer(layer);

    var tileSet = new TileSet(map.getMaxGlobalId() + 1);
    tileSet.name = "Desert";
    tileSet.imageInfo.url = "http://i.imgur.com/Sj89E15.png";
    tileSet.imageInfo.w = 265;
    tileSet.imageInfo.h = 199;
    tileSet.tileInfo.w = map.tileInfo.w;
    tileSet.tileInfo.h = map.tileInfo.h;
    tileSet.tileInfo.margin = 1;
    tileSet.tileInfo.spacing = 1;
    tileSet.generateTiles();
    map.addTileSet(tileSet);

    // Event Aggregator
    var aggregator = _.extend({}, Backbone.Events);

    // Map Model

    var mapModel = new MapModel({
        map: map
    });

    // Main Menu

    var mainMenuView = new MainMenuView({
        el: "#main-menu",
        model: mapModel,
        aggregator: aggregator
    });

    // Map Editor

    var mapEditorView = new MapEditorView({
        el: "#map-editor",
        model: mapModel,
        aggregator: aggregator
    });

    // Layer Manager

    var layerManagerView = new LayerManagerView({
        el: "#layer-manager",
        model: mapModel,
        aggregator: aggregator
    });

    // Tile Set Manager

    var tileSetManagerView = new TileSetManagerView({
        el: "#tile-set-manager",
        model: mapModel,
        aggregator: aggregator
    });
});