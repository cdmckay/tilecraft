define([
    "jquery",
    "backbone",
    "tmxjs/doodad-group",
    "tmxjs/tile-layer"
], function (
    $,
    Backbone,
    DoodadGroup,
    TileLayer
) {
    return Backbone.View.extend({
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
            this.listenTo(this.model, "changed:layers", this.render);
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
            var layer = new TileLayer(
                "Tile Layer " + (tileLayers.length + 1),
                this.model.get("map").bounds
            );
            this.model.insertLayerAt(0, layer);
            this.selectedOffset = 0;
            this.render();
        },
        addDoodadGroup: function () {
            var doodadGroups = this.model.getDoodadGroups();
            var layer = new DoodadGroup(
                "Object Group " + (doodadGroups.length + 1),
                this.model.get("map").bounds
            );
            this.model.insertLayerAt(0, layer);
            this.selectedOffset = 0;
            this.render();
        },
        raiseLayer: function () {
            var offset = this.selectedOffset;
            if (offset !== null && offset !== 0) {
                var layer = this.model.removeLayerAt(offset);
                this.model.insertLayerAt(offset - 1, layer);
                this.selectedOffset--;
                this.render();
            }
        },
        lowerLayer: function () {
            var offset = this.selectedOffset;
            if (offset !== null && offset !== this.model.get("map").layers.length - 1) {
                var layer = this.model.removeLayerAt(offset);
                this.model.insertLayerAt(offset + 1, layer);
                this.selectedOffset++;
                this.render();
            }
        },
        duplicateLayer: function () {
            var offset = this.selectedOffset;
            if (offset !== null) {
                var layer = this.model.get("map").layers[offset];
                var duplicateLayer = layer.clone();
                duplicateLayer.name = "Copy of " + duplicateLayer.name;
                this.model.insertLayerAt(offset, duplicateLayer);
            }
        },
        removeLayer: function () {
            var offset = this.selectedOffset;
            if (offset !== null) {
                this.model.removeLayerAt(offset);
                var layerCount = this.model.get("map").layers.length;
                this.selectedOffset = layerCount === 0 ? null : Math.min(offset, layerCount - 1);
                this.render();
            }
        }
    });
});