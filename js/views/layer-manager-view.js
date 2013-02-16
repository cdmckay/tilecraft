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
            "click .layer-manager-layers-item": "selectLayer",
            "dblclick .layer-manager-layers-item": "renameLayer",
            "click .layer-manager-layers-item input": "toggleVisible",
            "click .layer-manager-toolbar-add-button": "addTileLayer",
            "click .layer-manager-toolbar-up-button": "raiseLayer",
            "click .layer-manager-toolbar-down-button": "lowerLayer",
            "click .layer-manager-toolbar-duplicate-button": "duplicateLayer",
            "click .layer-manager-toolbar-remove-button": "removeLayer"
        },

        templates: {
            layersItem: Handlebars.compile($("#layers-item-template").html())
        },
        layersEl: null,

        /* The currently selected Layer index. */
        selectedIndex: null,

        initialize: function () {
            this.layersEl = this.$(".layer-manager-layers");

            // TODO Read in existing Layer information from model.

            this.listenTo(this.model, "change:layers", this.render);
        },
        render: function () {
            var view = this;
            var layers = this.model.get("map").layers;

            // This is for the case where a Layer has been added via the model.
            if (this.selectedIndex === null && layers.length) {
                this.selectedIndex = 0;
            }

            this.layersEl.empty();
            $.each(layers, function (i) {
                var layersItemEl = $(view.templates.layersItem({
                    name: this.name,
                    type: this instanceof TileLayer ? "Tiles" : "Objects"
                }));
                if (i === view.selectedIndex) {
                    layersItemEl.addClass("selected");
                }
                layersItemEl.find("input").prop("checked", this.visible);
                view.layersEl.append(layersItemEl);
            });

            return this;
        },

        selectLayer: function (event) {
            var el = $(event.currentTarget);
            var index = el.prevAll().length;
            var els = this.layersEl.children();

            // Remove old selected if it exists.
            if (this.selectedIndex !== null) {
                els.eq(this.selectedIndex).removeClass("selected");
            }

            els.eq(index).addClass("selected");
            this.selectedIndex = index;
        },
        renameLayer: function () {
            var index = this.selectedIndex;
            var name = this.model.get("map").layers[index].name;
            var result = prompt('Please enter the new Layer name:', name);
            if (result !== null && result !== "") {
                this.model.setLayerNameAt(index, result);
            }
        },
        toggleVisible: function (event) {
            var el = $(event.currentTarget);
            var index = el.parent().prevAll().length;
            this.model.setLayerVisibleAt(index, el.prop("checked"));
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
            this.selectedIndex = 0;
        },
        addDoodadGroup: function () {
            var doodadGroups = this.model.getDoodadGroups();
            var layer = new DoodadGroup(
                "Object Group " + (doodadGroups.length + 1),
                this.model.get("map").bounds
            );
            this.model.insertLayerAt(0, layer);
            this.selectedIndex = 0;
        },
        raiseLayer: function () {
            var index = this.selectedIndex;
            if (index !== null && index !== 0) {
                var layer = this.model.removeLayerAt(index);
                this.selectedIndex--;
                this.model.insertLayerAt(this.selectedIndex, layer);
            }
        },
        lowerLayer: function () {
            var index = this.selectedIndex;
            if (index !== null && index !== this.model.get("map").layers.length - 1) {
                var layer = this.model.removeLayerAt(index);
                this.selectedIndex++;
                this.model.insertLayerAt(this.selectedIndex, layer);
            }
        },
        duplicateLayer: function () {
            var index = this.selectedIndex;
            if (index !== null) {
                var layer = this.model.get("map").layers[index];
                var duplicateLayer = layer.clone();
                duplicateLayer.name = "Copy of " + duplicateLayer.name;
                this.model.insertLayerAt(index, duplicateLayer);
            }
        },
        removeLayer: function () {
            var index = this.selectedIndex;
            if (index !== null) {
                this.model.removeLayerAt(index);
                var layerCount = this.model.get("map").layers.length;
                this.selectedIndex = layerCount === 0 ? null : Math.min(index, layerCount - 1);
            }
        }
    });
});