define([
    "jquery",
    "backbone",
    "handlebars",
    "tmxjs/cell",
    "tmxjs/util/util"
], function (
    $,
    Backbone,
    Handlebars,
    Cell,
    Util
) {
    return Backbone.View.extend({
        events: {
            "mousedown": "updateMouseButtonState",
            "mouseup": "updateMouseButtonState",
            "mouseleave": "updateMouseButtonState",
            "mouseenter .map-editor-cell-selector": "showCellSelector",
            "mouseleave .map-editor-cell-selector": "hideCellSelector",
            "mouseover .map-editor-cell-selector": "highlightCell",
            "mousedown .map-editor-cell-selector": "selectCell"
        },

        aggregator: null,
        templates: {
            cell: Handlebars.compile($("#cell-template").html()),
            cellSelectorCell: Handlebars.compile($("#cell-selector-cell-template").html())
        },
        cellsEl: null,
        cellSelectorEl: null,
        cellSelectorMarkerEl: null,
        cellLayersEl: null,

        /* The mouse button state: true for down, false for up. */
        mouseButtonState: [],

        /* The currently selected Layer index. */
        selectedLayerIndex: null,

        /* The currently selected Tile global id. */
        selectedTileGlobalId: null,

        /* The currently selected Cell index. */
        selectedIndex: null,

        /* A stack containing the actions taken on the map. */
        actions: [],

        initialize: function (options) {
            this.aggregator = options.aggregator;

            this.cellsEl = this.$(".map-editor-cells");
            this.cellSelectorEl = this.cellsEl.children(".map-editor-cell-selector");
            this.cellSelectorMarkerEl = $("<div>")
                .on("mouseover", function (event) {
                    // Stop the marker from propagating mouseover events.
                    event.stopPropagation();
                });
            this.cellLayersEl = this.cellsEl.children(".map-editor-cell-layers");

            this.listenTo(this.model, "change:map", this.render);
            this.listenTo(this.model, "change:tileSets", this.render);
            this.listenTo(this.model, "change:layers:insert-layer", this.insertCellLayerElAt);
            this.listenTo(this.model, "change:layers:raise-layer", this.raiseCellLayerElAt);
            this.listenTo(this.model, "change:layers:lower-layer", this.lowerCellLayerElAt);
            this.listenTo(this.model, "change:layers:remove-layer", this.removeCellLayerElAt);
            this.listenTo(this.model, "change:layers:set-layer-visible", this.setCellLayerElVisibleAt);

            this.listenTo(this.aggregator, "change:select-layer", this.setSelectedLayerIndex);
            this.listenTo(this.aggregator, "change:select-tile", this.setSelectedTileGlobalId);
            this.listenTo(this.aggregator, "undo:change:set-cell", this.undo);

            this.render();
        },
        render: function () {
            var map = this.model.get("map");

            // This is for the case where a Layer has been added via the model.
            if (this.selectedLayerIndex === null && map.layers.length) {
                this.selectedLayerIndex = 0;
            }

            this.cellsEl.css({
                width: map.bounds.w * map.tileInfo.w,
                height: map.bounds.h * map.tileInfo.h
            });

            this.generateCellSelectorCellEls();
            this.generateCellLayerEls();
        },
        renderCellAt: function (layerIndex, index) {
            var map = this.model.get("map");
            var layer = map.layers[layerIndex];
            var cellLayerEl = this.getCellLayerElAt(layerIndex);
            var cellEl = cellLayerEl.children(Util.format("[data-index={0}]", index));
            var cell = layer.cells[index];
            if (cell) {
                if (!cellEl.length) {
                    var i = Math.floor(index % map.bounds.w);
                    var j = Math.floor(index / map.bounds.w);
                    cellEl = $(this.templates.cell({
                        index: index,
                        i: i * map.tileInfo.w,
                        j: j * map.tileInfo.h,
                        w: map.tileInfo.w,
                        h: map.tileInfo.h
                    }));
                    cellLayerEl.append(cellEl);
                }
                cellEl.css({
                    "background": Util.format(
                        "url({0}) no-repeat -{1}px -{2}px",
                        Util.urlFor(cell.tile.imageInfo.source, this.model.get("dir")),
                        cell.tile.bounds.x,
                        cell.tile.bounds.y
                    )
                });
            } else {
                cellEl.remove();
            }
        },

        setSelectedLayerIndex: function (index) {
            this.selectedLayerIndex = index;
        },
        setSelectedTileGlobalId: function (globalId) {
            this.selectedTileGlobalId = globalId;

            // Also set the cell selector marker image.
            if (globalId) {
                var tile = this.model.get("map").findTile(globalId);
                this.cellSelectorMarkerEl.css({
                    "background": Util.format(
                        "url({0}) no-repeat -{1}px -{2}px",
                        Util.urlFor(tile.imageInfo.source, this.model.get("dir")),
                        tile.bounds.x,
                        tile.bounds.y
                    )
                });
            } else {
                this.cellSelectorMarkerEl.detach();
            }
        },
        insertCellLayerElAt: function (index) {
            var map = this.model.get("map");
            var layer = map.layers[index];
            var cellLayerEl = this.generateCellLayerEl(layer);
            var cellLayerElsCount = this.cellLayersEl.children().length;
            if (cellLayerElsCount === 0 || cellLayerElsCount === index) {
                this.cellLayersEl.append(cellLayerEl);
            } else {
                this.getCellLayerElAt(index).before(cellLayerEl);
            }
        },
        raiseCellLayerElAt: function (index) {
            var cellLayerElsCount = this.cellLayersEl.children().length;
            if (cellLayerElsCount <= 1 || index === cellLayerElsCount + 1) return;

            var cellLayerEl = this.getCellLayerElAt(index);
            cellLayerEl.insertAfter(cellLayerEl.next());
        },
        lowerCellLayerElAt: function (index) {
            var cellLayerElsCount = this.cellLayersEl.children().length;
            if (cellLayerElsCount <= 1 || index === 0) return;

            var cellLayerEl = this.getCellLayerElAt(index);
            cellLayerEl.insertBefore(cellLayerEl.prev());
        },
        removeCellLayerElAt: function (index) {
            this.getCellLayerElAt(index).remove();
        },
        setCellLayerElVisibleAt: function (index, visible) {
            this.getCellLayerElAt(index).css("display", visible ? "block" : "none");
        },
        getCellLayerElAt: function (index) {
            var cellLayerEls = this.cellLayersEl.children();
            return cellLayerEls.length ? cellLayerEls.eq(index) : null;
        },
        insertSelectedTileAt: function (index) {
            var map = this.model.get("map");
            var layer = map.layers[this.selectedLayerIndex];
            var tile = map.findTile(this.selectedTileGlobalId);

            this.actions.push({
                type: "set-cell",
                layerIndex: this.selectedLayerIndex,
                index: index,
                cell: layer.cells[index]
            });
            this.model.setCellAt(this.selectedLayerIndex, index, new Cell(tile));
            this.aggregator.trigger("change:set-cell");

            this.renderCellAt(this.selectedLayerIndex, index);
        },

        showCellSelector: function () {
            if (!this.isMapEditable()) return;

            this.cellSelectorMarkerEl.show();
        },
        hideCellSelector: function () {
            if (!this.isMapEditable()) return;

            this.cellSelectorMarkerEl.hide();
        },
        undo: function () {
            if (!this.actions.length) return;

            var action = this.actions.pop();
            this.model.setCellAt(action.layerIndex, action.index, action.cell);

            this.renderCellAt(action.layerIndex, action.index);
        },

        updateMouseButtonState: function (event) {
            switch (event.type) {
                case "mousedown":
                    this.mouseButtonState[event.which] = true;
                    break;
                case "mouseup":
                    this.mouseButtonState[event.which] = false;
                    break;
                case "mouseleave":
                    this.mouseButtonState.length = 0;
                    break;
            }
        },
        highlightCell: function (event) {
            if (!this.isMapEditable()) return;

            var cellEl = $(event.target);
            if (cellEl.length) {
                var index = parseInt(cellEl.attr("data-index"));
                var cellEls = this.cellSelectorEl.children();

                this.selectedIndex = index;
                cellEls.eq(index).append(this.cellSelectorMarkerEl.detach());

                // If mouse button is down, then we should insert the cell as well.
                if (this.mouseButtonState[1]) {
                    this.insertSelectedTileAt(index);
                }
            }
        },
        selectCell: function (event) {
            if (!this.isMapEditable()) return;

            var cellEl = $(event.target).parent();
            if (cellEl.length) {
                var index = parseInt(cellEl.attr("data-index"));
                this.insertSelectedTileAt(index);
            }
        },

        isMapEditable: function () {
            return this.selectedLayerIndex !== null && this.selectedTileGlobalId !== null;
        },
        generateCellLayerEl: function (layer) {
            var map = this.model.get("map");
            var cellLayerEl = $("<div>", {
                class: "map-editor-cell-layer",
                style: "display: " + (layer.visible ? "block" : "none") + ";"
            });
            for (var j = 0; j < map.bounds.h; j++) {
                for (var i = 0; i < map.bounds.w; i++) {
                    var index = j * map.bounds.w + i;
                    var cell = layer.cells[index];
                    if (cell) {
                        var cellEl = $(this.templates.cell({
                            index: index,
                            i: i * map.tileInfo.w,
                            j: j * map.tileInfo.h,
                            w: map.tileInfo.w,
                            h: map.tileInfo.h
                        })).css({
                            "background": Util.format(
                                "url({0}) no-repeat -{1}px -{2}px",
                                Util.urlFor(cell.tile.imageInfo.source, this.model.get("dir")),
                                cell.tile.bounds.x,
                                cell.tile.bounds.y
                            )
                        });
                    }
                    cellLayerEl.append(cellEl);
                } // end for
            } // end for
            return cellLayerEl;
        },
        generateCellLayerEls: function () {
            this.cellLayersEl.detach().empty();
            var view = this;
            var map = this.model.get("map");
            $.each(map.layers, function (li, layer) {
                var cellLayerEl = view.generateCellLayerEl(layer);
                view.cellLayersEl.append(cellLayerEl);
            });
            this.cellsEl.prepend(this.cellLayersEl);
        },
        generateCellSelectorCellEls: function () {
            this.cellSelectorEl.detach().empty();
            var map = this.model.get("map");
            for (var j = 0; j < map.bounds.h; j++) {
                for (var i = 0; i < map.bounds.w; i++) {
                    var cellSelectorCellEl = $(this.templates.cellSelectorCell({
                        index: j * map.bounds.w + i,
                        i: i * map.tileInfo.w,
                        j: j * map.tileInfo.h,
                        w: map.tileInfo.w,
                        h: map.tileInfo.h
                    }));
                    this.cellSelectorEl.append(cellSelectorCellEl);
                } // end for
            } // end for
            this.cellsEl.prepend(this.cellSelectorEl);
        }
    });
});
