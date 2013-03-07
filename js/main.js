require.config({
    paths: {
        "jquery": "lib/jquery",
        "jquery-colorbox": "lib/jquery.colorbox",
        "jquery-validate": "lib/jquery.validate",
        "underscore": "lib/underscore",
        "backbone": "lib/backbone",
        "handlebars": "lib/handlebars",
        "zlib": "lib/zlib.min",
        "tmxjs": "lib/tmxjs"
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
    // Emulate HTTP for my crappy host.
    Backbone.emulateHTTP = true;

    // Event Aggregator
    var aggregator = _.extend({}, Backbone.Events);

    // Map Model
    var mapModel = new MapModel({
        urlRoot: 'endpoint.php?r=map',
        map: new Map(Map.Orientation.ORTHOGONAL, 32, 32, 40, 40)
    });

    var url = "examples/desert-with-layers.tmx";
    var options = {
        dir: url.split("/").slice(0, -1) || "."
    };
    $.get(url, {}, null, "xml")
        .done(function (xml) {
            Map.fromXML(xml, options).done(function (map) {
                mapModel.set("dir", options.dir);
                mapModel.set("map", map);
            });
        })
        .fail(function () {
            alert("Failed to open TMX file.");
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