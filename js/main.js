require.config({
    paths: {
        "underscore": "lib/underscore",
        "backbone": "lib/backbone",
        "handlebars": "lib/handlebars",
        "jquery": "lib/jquery",
        "jquery-ui": "lib/jquery-ui",
        "tmxjs": "lib/tmxjs",
        "gunzip": "lib/gunzip.min",
        "inflate": "lib/inflate.min"
    },
    shim: {
        "backbone": { exports: "Backbone", deps: ["underscore"] },
        "handlebars": { exports: "Handlebars" },
        "jquery-ui": { exports: "$", deps: ["jquery"] },
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
    "tmxjs/map",
    "tmxjs/tile-layer",
    "tmxjs/util/string-util"
], function (
    Backbone,
    Handlebars,
    Gunzip,
    Inflate,
    $,
    Map,
    TileLayer,
    StringUtil
) {
    var mapWidth = 40;
    var mapHeight = 40;
    var mapTileWidth = 32;
    var mapTileHeight = 32;

    var map = new Map("orthogonal", mapWidth, mapHeight, mapTileWidth, mapTileHeight);
    map.addLayer(new TileLayer(map));
});