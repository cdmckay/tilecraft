require.config({
    paths: {
        "jquery": "lib/jquery",
        "jquery-colorbox": "lib/jquery.colorbox",
        "underscore": "lib/underscore",
        "backbone": "lib/backbone",
        "handlebars": "lib/handlebars",
        "tmxjs": "lib/tmxjs",
        "gunzip": "lib/gunzip.min",
        "inflate": "lib/inflate.min"
    },
    shim: {
        "jquery-colorbox": { deps: ["jquery"] },
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
    "underscore",
    "backbone",
    "handlebars",
    "gunzip",
    "inflate",
    "./models/map-model",
    "./views/layer-manager-view",
    "tmxjs/map",
    "tmxjs/tile-set"
], function (
    $,
    Colorbox,
    _,
    Backbone,
    Handlebars,
    Gunzip,
    Inflate,
    MapModel,
    LayerManagerView,
    Map,
    TileSet
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
    layerManagerView.addDoodadGroup();

    // Tile Set Manager

    var TileSetModel = Backbone.Model.extend({
    });

    var tileSet = new TileSet();
    var tileSetModel = new TileSetModel({
        tileSet: tileSet
    });

    var TileSetEditorView = Backbone.View.extend({

    });

    var tileSetEditorView = new TileSetEditorView({
        el: "#tile-set-editor",
        model: tileSetModel
    });

    $(".tile-set-manager-toolbar-add-button").on("click", function () {
        $.colorbox({
            inline: true,
            href: "#tile-set-editor",
            title: "Add Tile Set",
            overlayClose: false,
            transition: "none",
            onClosed: function () {
                // This is to fix a bug with Colorbox where the second time it opens it incorrectly sizes
                // the cboxLoadedContent div. This may be side-effect of using box-sizing: border-box.
                $.colorbox.remove();
            }
        });
    });
});