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
    "tmxjs/doodad-group",
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
    DoodadGroup,
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
        addLayer: function (layer) {
            this.get("map").addLayer(layer);
            this.trigger("layer:added");
        },
        setLayerVisibleAt: function (index, visible) {
            this.get("map").layers[index].visible = visible;
            this.trigger("layer:changed");
        },
        getLayers: function () {
            return this.get("map").layers;
        },
        getTileLayers: function () {
            return this.get("map").getTileLayers();
        },
        getDoodadGroups: function () {
            return this.get("map").getDoodadGroups();
        }
    });
    var mapModel = new MapModel();
    mapModel.set("map", map);

    var LayerManagerView = Backbone.View.extend({
        events: {
            "click .layer-manager-layers-list-item input": "toggleVisible",
            "click .layer-manager-toolbar-add-button": "addTileLayer"
        },
        initialize: function () {
            this.listenTo(this.model, "layer:added", this.render);
            this.listenTo(this.model, "layer:changed", this.render);
        },
        render: function () {
            var layers = this.model.get("map").layers;
            var layersList = this.$(".layer-manager-layers");
            var template = this.templates.layersListItem;
            layersList.empty();
            $.each(layers, function () {
                var layersListItem = $(template({
                    name: this.name,
                    type: this instanceof TileLayer ? "Tiles" : "Objects"
                }));
                layersListItem.find("input").prop("checked", this.visible);
                layersList.append(layersListItem);
            });
            return this;
        },
        templates: {
            layersListItem: Handlebars.compile($("#layers-list-item-template").html())
        },
        toggleVisible: function (event) {
            var el = $(event.target);
            var offset = el.parent().prevAll().length;
            this.model.setLayerVisibleAt(offset, el.prop("checked"));
            event.preventDefault();
        },
        addTileLayer: function () {
            var tileLayers = this.model.getTileLayers();
            var layer = new TileLayer(map);
            layer.name = "Tile Layer " + (tileLayers.length + 1);
            this.model.addLayer(layer);
        },
        addDoodadGroup: function () {
            var doodadGroups = this.model.getDoodadGroups();
            var layer = new DoodadGroup(map);
            layer.name = "Object Group " + (doodadGroups.length + 1);
            this.model.addLayer(layer);
        }
    });
    var layerManagerView = new LayerManagerView({
        el: $("#layer-manager"),
        model: mapModel
    });
    layerManagerView.addDoodadGroup();
});