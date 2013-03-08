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

            this.listenTo(this.aggregator, "undo:change:set-layer-name", this.undo);
            this.listenTo(this.aggregator, "undo:change:set-layer-visible", this.undo);
            this.listenTo(this.aggregator, "undo:change:insert-layer", this.undo);
            this.listenTo(this.aggregator, "undo:change:remove-layer", this.undo);
            this.listenTo(this.aggregator, "undo:change:raise-layer", this.undo);
            this.listenTo(this.aggregator, "undo:change:lower-layer", this.undo);

            var layers = this.model.getLayers();
            if (layers.length) {
                this.indexLayers();
            }
        },
        render: function () {
            var view = this;
            var layers = this.model.getLayers();

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
                view.layersEl.prepend(layersItemEl);
            });

            return this;
        },

        indexLayers: function () {
            var layers = this.model.getLayers();
            var newIndex = this.selectedIndex;

            // Make sure the index is within bounds.
            if (layers.length) {
                if (this.selectedIndex === null) newIndex = layers.length - 1;
                if (this.selectedIndex >= layers.length) newIndex = 0;
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
            var index = el.nextAll().length;
            var els = this.layersEl.children();

            // Remove old selected if it exists.
            if (this.selectedIndex !== null) {
                els.eq(els.length - this.selectedIndex - 1).removeClass("selected");
            }

            els.eq(els.length - index - 1).addClass("selected");
            this.selectedIndex = index;

            // Trigger event in the aggregator.
            this.aggregator.trigger("change:select-layer", index);
        },
        renameLayer: function () {
            var index = this.selectedIndex;
            var name = this.model.getLayerNameAt(index);
            var result = prompt('Please enter the new Layer name:', name);
            if (result !== null && result !== "") {
                this.actions.push({
                    type: "set-layer-name",
                    index: index,
                    name: name
                });
                this.model.setLayerNameAt(index, result);
                this.aggregator.trigger("change:set-layer-name", index);
            }
        },
        toggleLayerVisible: function (event) {
            var el = $(event.currentTarget);
            var index = el.parent().nextAll().length;

            this.actions.push({
                type: "set-layer-visible",
                index: index,
                visible: this.model.getLayerVisibleAt(index)
            });
            this.model.setLayerVisibleAt(index, el.prop("checked"));
            this.aggregator.trigger("change:set-layer-visible", index);

            event.preventDefault();
            event.stopPropagation();
        },
        addTileLayer: function () {
            var index = this.model.getLayers().length;
            var tileLayerCount = this.model.getTileLayers().length;
            var layer = new TileLayer(
                "Tile Layer " + (tileLayerCount + 1),
                this.model.get("map").bounds.clone()
            );
            layer.format = TileLayer.Format.BASE64_ZLIB;

            this.actions.push({
                type: "insert-layer",
                index: index
            });
            this.insertLayerAt(index, layer);
            this.aggregator.trigger("change:insert-layer", index, layer);
            this.aggregator.trigger("change:select-layer", this.selectedIndex);
        },
        raiseLayer: function () {
            var index = this.selectedIndex;
            if (index !== null && index !== this.model.getLayers().length - 1) {
                this.actions.push({
                    type: "raise-layer",
                    index: index
                });
                this.raiseLayerAt(index);
                this.aggregator.trigger("change:raise-layer", index);
                this.aggregator.trigger("change:select-layer", this.selectedIndex);
            }
        },
        lowerLayer: function () {
            var index = this.selectedIndex;
            if (index !== null && index !== 0) {
                this.actions.push({
                    type: "lower-layer",
                    index: index
                });
                this.lowerLayerAt(index);
                this.aggregator.trigger("change:lower-layer", index);
                this.aggregator.trigger("change:select-layer", this.selectedIndex);
            }
        },
        duplicateLayer: function () {
            var index = this.selectedIndex;
            if (index !== null) {
                var newIndex = index + 1;
                var layer = this.model.getLayerAt(index);
                var duplicateLayer = layer.clone();
                duplicateLayer.name = "Copy of " + duplicateLayer.name;

                this.actions.push({
                    type: "insert-layer",
                    index: newIndex
                });
                this.insertLayerAt(newIndex, duplicateLayer);
                this.aggregator.trigger("change:insert-layer", newIndex, duplicateLayer);
                this.aggregator.trigger("change:select-layer", this.selectedIndex);
            }
        },
        removeLayer: function () {
            var index = this.selectedIndex;
            if (index !== null) {
                this.actions.push({
                    type: "remove-layer",
                    index: index,
                    layer: this.model.getLayerAt(index)
                });
                this.removeLayerAt(index);
                this.aggregator.trigger("change:remove-layer", index);
                this.aggregator.trigger("change:select-layer", this.selectedIndex);
            }
        },
        undo: function () {
            if (!this.actions.length) return;
            var action = this.actions.pop();
            switch (action.type) {
                case "set-layer-name":
                    this.model.setLayerNameAt(action.index, action.name);
                    break;
                case "set-layer-visible":
                    this.model.setLayerVisibleAt(action.index, action.visible);
                    break;
                case "insert-layer":
                    this.removeLayerAt(action.index);
                    break;
                case "remove-layer":
                    this.insertLayerAt(action.index, action.layer);
                    break;
                case "raise-layer":
                    this.lowerLayerAt(action.index + 1);
                    break;
                case "lower-layer":
                    this.raiseLayerAt(action.index - 1);
                    break;
                default:
                    throw new Error("Unknown action type: " + action.type);
            } // end switch
            this.aggregator.trigger("change:select-layer", this.selectedIndex);
        },

        insertLayerAt: function (index, layer) {
            this.selectedIndex = index;
            this.model.insertLayerAt(index, layer);
        },
        removeLayerAt: function (index) {
            var layers = this.model.getLayers();
            var newLayerCount = layers.length - 1;

            this.selectedIndex = newLayerCount === 0 ? null : Math.min(index, newLayerCount - 1);
            this.model.removeLayerAt(index);
        },
        raiseLayerAt: function (index) {
            this.selectedIndex = index + 1;
            this.model.raiseLayerAt(index);
        },
        lowerLayerAt: function (index) {
            this.selectedIndex = index - 1;
            this.model.lowerLayerAt(index);
        }
    });
});