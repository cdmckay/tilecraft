define([
    "jquery",
    "backbone",
    "handlebars",
    "tmxjs/doodad-group",
    "tmxjs/tile-layer"
], function (
    $,
    Backbone,
    Handlebars,
    DoodadGroup,
    TileLayer
) {
    return Backbone.View.extend({
        events: {
            "click .layer-manager-layers-item": "selectLayer",
            "dblclick .layer-manager-layers-item": "renameLayer",
            "click .layer-manager-layers-item input": "toggleLayerVisible",
            "click .layer-manager-toolbar-add-button": "addTileLayer",
            "click .layer-manager-toolbar-raise-button": "raiseLayer",
            "click .layer-manager-toolbar-lower-button": "lowerLayer",
            "click .layer-manager-toolbar-duplicate-button": "duplicateLayer",
            "click .layer-manager-toolbar-remove-button": "removeLayer"
        },

        aggregator: null,
        templates: {
            layersItem: Handlebars.compile($("#layers-item-template").html())
        },
        layersEl: null,

        /* The currently selected Layer index. */
        selectedIndex: null,

        /* A stack containing the actions taken on the layers. */
        actions: [],

        initialize: function (options) {
            this.aggregator = options.aggregator;

            this.layersEl = this.$(".layer-manager-layers");

            this.listenTo(this.model, "change:map", this.indexLayers);
            this.listenTo(this.model, "change:layers", this.indexLayers);

            this.listenTo(this.aggregator, "undo:change:layers:set-layer-visible", this.undo);

            var layers = this.model.get("map").layers;
            if (layers.length) {
                this.indexLayers();
            }
        },
        render: function () {
            var view = this;
            var layers = this.model.get("map").layers;

            this.layersEl.empty();
            $.each(layers, function (li, layer) {
                var layersItemEl = $(view.templates.layersItem({
                    name: layer.name,
                    type: layer instanceof TileLayer ? "Tiles" : "Objects"
                }));
                if (li === view.selectedIndex) {
                    layersItemEl.addClass("selected");
                }
                layersItemEl.find("input").prop("checked", layer.visible);
                view.layersEl.append(layersItemEl);
            });

            return this;
        },

        indexLayers: function () {
            var layers = this.model.get("map").layers;
            var newIndex = this.selectedIndex;

            // Make sure the index is within bounds.
            if (layers.length) {
                if (this.selectedIndex === null) newIndex = 0;
                if (this.selectedIndex >= layers.length) newIndex = layers.length - 1;
            } else {
                if (this.selectedIndex !== null) newIndex = null;
            }

            // If they changed, update them and notify.
            if (newIndex !== this.selectedIndex) {
                this.selectedIndex = newIndex;
                this.aggregator.trigger("change:select-layer", newIndex);
            }

            this.render();
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

            // Trigger event in the aggregator.
            this.aggregator.trigger("change:select-layer", index);
        },
        renameLayer: function () {
            var index = this.selectedIndex;
            var name = this.model.get("map").layers[index].name;
            var result = prompt('Please enter the new Layer name:', name);
            if (result !== null && result !== "") {
                this.model.setLayerNameAt(index, result);
            }
        },
        toggleLayerVisible: function (event) {
            var el = $(event.currentTarget);
            var index = el.parent().prevAll().length;

            this.actions.push({
                type: "set-layer-visible",
                index: index,
                visible: this.model.getLayerVisibleAt(index)
            });
            this.model.setLayerVisibleAt(index, el.prop("checked"));

            event.preventDefault();
            event.stopPropagation();
        },
        addTileLayer: function () {
            var tileLayers = this.model.getTileLayers();
            var layer = new TileLayer(
                "Tile Layer " + (tileLayers.length + 1),
                this.model.get("map").bounds.clone()
            );
            layer.format = TileLayer.Format.BASE64_ZLIB;
            this.selectedIndex = 0;
            this.model.insertLayerAt(0, layer);

            // Trigger events in the aggregator.
            this.aggregator.trigger("change:select-layer", this.selectedIndex);
        },
        addDoodadGroup: function () {
            var doodadGroups = this.model.getDoodadGroups();
            var layer = new DoodadGroup(
                "Object Group " + (doodadGroups.length + 1),
                this.model.get("map").bounds.clone()
            );
            this.selectedIndex = 0;
            this.model.insertLayerAt(0, layer);

            // Trigger events in the aggregator.
            this.aggregator.trigger("change:select-layer", this.selectedIndex);
        },
        raiseLayer: function () {
            var index = this.selectedIndex;
            if (index !== null && index !== 0) {
                var layer = this.model.removeLayerAt(index);
                this.selectedIndex--;
                this.model.insertLayerAt(this.selectedIndex, layer);

                // Trigger events in the aggregator.
                this.aggregator.trigger("change:select-layer", this.selectedIndex);
            }
        },
        lowerLayer: function () {
            var index = this.selectedIndex;
            if (index !== null && index !== this.model.get("map").layers.length - 1) {
                var layer = this.model.removeLayerAt(index);
                this.selectedIndex++;
                this.model.insertLayerAt(this.selectedIndex, layer);

                // Trigger events in the aggregator.
                this.aggregator.trigger("change:select-layer", this.selectedIndex);
            }
        },
        duplicateLayer: function () {
            var index = this.selectedIndex;
            if (index !== null) {
                var layer = this.model.get("map").layers[index];
                var duplicateLayer = layer.clone();
                duplicateLayer.name = "Copy of " + duplicateLayer.name;
                this.model.insertLayerAt(index, duplicateLayer);

                // Trigger events in the aggregator.
                this.aggregator.trigger("change:select-layer", this.selectedIndex);
            }
        },
        removeLayer: function () {
            var index = this.selectedIndex;
            if (index !== null) {
                var newLayerCount = this.model.get("map").layers.length - 1;
                this.selectedIndex = newLayerCount === 0 ? null : Math.min(index, newLayerCount - 1);
                this.model.removeLayerAt(index);

                // Trigger events in the aggregator.
                this.aggregator.trigger("change:select-layer", this.selectedIndex);
            }
        },
        undo: function () {
            if (this.actions.length) {
                var map = this.model.get("map");
                var action = this.actions.pop();
                switch (action.type) {
                    case "set-layer-visible":
                        this.model.setLayerVisibleAt(action.index, action.visible);
                        break;
                    default:
                        throw new Error("Unknown action type: " + action.type);
                }
            }
        }
    });
});