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

        initialize: function (options) {
            this.aggregator = options.aggregator;

            this.cellsEl = this.$(".map-editor-cells");
            this.cellSelectorEl = this.cellsEl.children(".map-editor-cell-selector");
            this.cellSelectorMarkerEl = $("<div>");
            this.cellLayersEl = this.cellsEl.children(".map-editor-cell-layers");

            this.listenTo(this.model, "change:map", this.render);
            this.listenTo(this.model, "change:layers:insert-layer", this.insertCellLayerElAt);
            this.listenTo(this.model, "change:layers:remove-layer", this.removeCellLayerElAt);
            this.listenTo(this.model, "change:layers:change-layer-visible", this.changeCellLayerElVisibleAt);
            this.listenTo(this.aggregator, "change:select-layer", this.setSelectedLayerIndex);
            this.listenTo(this.aggregator, "change:select-tile", this.setSelectedTileGlobalId);

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
        renderCellAt: function (index) {
            var layers = this.model.get("map").layers;
            var layer = layers[this.selectedLayerIndex];
            var cell = layer.cells[index];
            if (cell) {
                var cellLayerEl = this.getCellLayerElAt(this.selectedLayerIndex);
                var cellEl = cellLayerEl.children().eq(index);
                cellEl.css({
                    "background": Util.format(
                        "url({0}) no-repeat -{1}px -{2}px",
                        Util.urlFor(cell.tile.imageInfo.source, this.model.get("dir")),
                        cell.tile.bounds.x,
                        cell.tile.bounds.y
                    )
                });
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
            var layers = this.model.get("map").layers;
            var layer = layers[index];
            var cellLayerEl = this.generateCellLayerEl(layer);
            var cellLayerElsCount = this.cellLayersEl.children().length;
            if (cellLayerElsCount === 0 || cellLayerElsCount === index) {
                this.cellLayersEl.prepend(cellLayerEl);
            } else {
                this.getCellLayerElAt(index).after(cellLayerEl);
            }
        },
        removeCellLayerElAt: function (index) {
            this.getCellLayerElAt(index).remove();
        },
        changeCellLayerElVisibleAt: function (index, visible) {
            this.getCellLayerElAt(index).css("display", visible ? "block" : "none");
        },
        getCellLayerElAt: function (index) {
            var cellLayerEls = this.cellLayersEl.children();
            return cellLayerEls.length ? cellLayerEls.eq(cellLayerEls.length - index - 1) : null;
        },

        showCellSelector: function () {
            if (!this.isMapEditable()) return;

            this.cellSelectorMarkerEl.show();
        },
        hideCellSelector: function () {
            if (!this.isMapEditable()) return;

            this.cellSelectorMarkerEl.hide();
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

            var cellEl = $(event.target).parents().addBack().filter(".map-editor-cell-selector > div");
            if (cellEl.length) {
                var index = parseInt(cellEl.attr("data-index"));
                var cellEls = this.cellSelectorEl.children();

                this.selectedIndex = index;
                cellEls.eq(index).append(this.cellSelectorMarkerEl.detach());

                // If mouse button is down, then we should select the cell as well.
                if (this.mouseButtonState[1]) this.selectCell(event);
            }
        },
        selectCell: function (event) {
            if (!this.isMapEditable()) return;

            var cellEl = $(event.target).parents().addBack().filter(".map-editor-cell-selector > div");
            if (cellEl.length) {
                var index = parseInt(cellEl.attr("data-index"));

                var map = this.model.get("map");
                var layer = map.layers[this.selectedLayerIndex];
                var tile = map.findTile(this.selectedTileGlobalId);
                layer.cells[index] = new Cell(tile);
                this.renderCellAt(index);
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
                    var cellEl = $(this.templates.cell({
                        index: index,
                        i: i * map.tileInfo.w,
                        j: j * map.tileInfo.h,
                        w: map.tileInfo.w,
                        h: map.tileInfo.h
                    }));
                    var cell = layer.cells[index];
                    if (cell) {
                        cellEl.css({
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
                view.cellLayersEl.prepend(cellLayerEl);
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