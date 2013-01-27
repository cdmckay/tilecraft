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
        insertLayerAt: function (index, layer) {
            this.get("map").insertLayerAt(index, layer);
            this.trigger("layer:added");
        },
        removeLayerAt: function (index) {
            var layer = this.get("map").removeLayerAt(index);
            this.trigger("layer:removed");
            return layer;
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
            "click .layer-manager-layers-list-item": "select",
            "click .layer-manager-layers-list-item input": "toggleVisible",
            "click .layer-manager-toolbar-add-button": "addTileLayer",
            "click .layer-manager-toolbar-up-button": "raiseLayer",
            "click .layer-manager-toolbar-down-button": "lowerLayer",
            "click .layer-manager-toolbar-duplicate-button": "duplicateLayer",
            "click .layer-manager-toolbar-remove-button": "removeLayer"
        },
        initialize: function () {
            this.listenTo(this.model, "layer:added", this.render);
            this.listenTo(this.model, "layer:changed", this.render);
            this.listenTo(this.model, "layer:removed", this.render);
        },
        render: function () {
            var view = this;
            var layers = this.model.get("map").layers;
            var layersList = this.$(".layer-manager-layers");
            layersList.empty();
            $.each(layers, function (i) {
                var layersListItem = $(view.templates.layersListItem({
                    name: this.name,
                    type: this instanceof TileLayer ? "Tiles" : "Objects"
                }));
                if (i === view.selectedOffset) {
                    layersListItem.addClass("selected");
                }
                layersListItem.find("input").prop("checked", this.visible);
                layersList.append(layersListItem);
            });
            return this;
        },
        templates: {
            layersListItem: Handlebars.compile($("#layers-list-item-template").html())
        },
        selectedOffset: null,
        select: function (event) {
            var el = $(event.currentTarget);
            var offset = el.prevAll().length;
            this.selectedOffset = offset;
            this.$(".layer-manager-layers li")
                .removeClass("selected")
                .eq(offset).addClass("selected");
        },
        toggleVisible: function (event) {
            var el = $(event.currentTarget);
            var offset = el.parent().prevAll().length;
            this.model.setLayerVisibleAt(offset, el.prop("checked"));
            event.preventDefault();
            event.stopPropagation();
        },
        addTileLayer: function () {
            var tileLayers = this.model.getTileLayers();
            var layer = new TileLayer(map);
            layer.name = "Tile Layer " + (tileLayers.length + 1);
            this.selectedOffset = 0;
            this.model.insertLayerAt(0, layer);
        },
        addDoodadGroup: function () {
            var doodadGroups = this.model.getDoodadGroups();
            var layer = new DoodadGroup(map);
            layer.name = "Object Group " + (doodadGroups.length + 1);
            this.selectedOffset = 0;
            this.model.insertLayerAt(0, layer);
        },
        raiseLayer: function () {
            var offset = this.selectedOffset;
            if (offset !== null && offset !== 0) {
                this.selectedOffset--;
                var layer = this.model.removeLayerAt(offset);
                this.model.insertLayerAt(offset - 1, layer);
            }
        },
        lowerLayer: function () {
            var offset = this.selectedOffset;
            if (offset !== null && offset !== this.model.getLayers().length - 1) {
                this.selectedOffset++;
                var layer = this.model.removeLayerAt(offset);
                this.model.insertLayerAt(offset + 1, layer);
            }
        },
        duplicateLayer: function () {
            var offset = this.selectedOffset;
            if (offset !== null) {
                var layer = this.model.getLayers()[offset];
                var duplicateLayer = layer.clone();
                duplicateLayer.name = "Copy of " + duplicateLayer.name;
                this.model.insertLayerAt(offset, duplicateLayer);
            }
        },
        removeLayer: function () {

        }
    });
    var layerManagerView = new LayerManagerView({
        el: "#layer-manager",
        model: mapModel
    });
    layerManagerView.addDoodadGroup();
});