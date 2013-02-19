define([
    "jquery",
    "backbone",
    "handlebars",
    "tmxjs/cell",
    "tmxjs/util/string-util"
], function (
    $,
    Backbone,
    Handlebars,
    Cell,
    StringUtil
) {
    return Backbone.View.extend({
        events: {
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

            this.listenTo(this.model, "change:layers-visible", this.setCellLayerElVisible);
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
                var cellLayerEl = this.cellLayersEl.children().eq(this.selectedLayerIndex);
                var cellEl = cellLayerEl.children().eq(index);
                cellEl.css({
                    "background": StringUtil.format(
                        "url({0}) no-repeat -{1}px -{2}px",
                        cell.tile.imageInfo.url,
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
            var tile = this.model.get("map").findTile(globalId);
            this.cellSelectorMarkerEl.css({
                "background": StringUtil.format(
                    "url({0}) no-repeat -{1}px -{2}px",
                    tile.imageInfo.url,
                    tile.bounds.x,
                    tile.bounds.y
                )
            });
        },
        setCellLayerElVisible: function(index, visible) {
            this.cellLayersEl.children().eq(index).css("display", visible ? "block" : "none");
        },

        showCellSelector: function () {
            // Can't select a cell if there are no layers.
            if (this.selectedLayerIndex === null) {
                return;
            }

            this.cellSelectorMarkerEl.show();
        },
        hideCellSelector: function () {
            // Can't select a cell if there are no layers.
            if (this.selectedLayerIndex === null) {
                return;
            }

            this.cellSelectorMarkerEl.hide();
        },
        highlightCell: function (event) {
            // Can't select a cell if there are no layers.
            if (this.selectedLayerIndex === null) {
                return;
            }

            var el = $(event.target);
            if (el.parent().hasClass("map-editor-cell-selector")) {
                var index = parseInt(el.attr("data-index"));
                var cellEls = this.cellSelectorEl.children();

                this.selectedIndex = index;
                cellEls.eq(index).append(this.cellSelectorMarkerEl.detach());
            }
        },
        selectCell: function (event) {
            // Can't select a cell if there are no layers.
            if (this.selectedLayerIndex === null || this.selectedTileGlobalId === null) {
                return;
            }

            var el = $(event.target).parent();
            if (el.parent().hasClass("map-editor-cell-selector")) {
                var index = parseInt(el.attr("data-index"));

                var map = this.model.get("map");
                var layer = map.layers[this.selectedLayerIndex];
                var tile = map.findTile(this.selectedTileGlobalId);
                layer.cells[index] = new Cell(tile);
                this.renderCellAt(index);
            }
        },

        generateCellLayerEls: function () {
            this.cellLayersEl.detach().empty();

            var view = this;
            var map = this.model.get("map");
            $.each(map.layers, function (li, layer) {
                var cellLayerEl = $("<div>", { class: "map-editor-cell-layer" });
                for (var j = 0; j < map.bounds.h; j++) {
                    for (var i = 0; i < map.bounds.w; i++) {
                        var index = j * map.bounds.w + i;
                        var cellEl = $(view.templates.cell({
                            index: index,
                            i: i * map.tileInfo.w,
                            j: j * map.tileInfo.h,
                            w: map.tileInfo.w,
                            h: map.tileInfo.h
                        }));
                        var cell = layer.cells[index];
                        if (cell) {
                            cellEl.css({
                                "background": StringUtil.format(
                                    "url({0}) no-repeat -{1}px -{2}px",
                                    cell.tile.imageInfo.url,
                                    cell.tile.bounds.x,
                                    cell.tile.bounds.y
                                )
                            });
                        }
                        cellLayerEl.append(cellEl);
                    } // end for
                } // end for
                view.cellLayersEl.append(cellLayerEl);
            });

            this.cellsEl.prepend(this.cellLayersEl);
        },
        generateCellSelectorCellEls: function () {
            this.cellSelectorEl.detach().empty();

            var map = this.model.get("map");
            for (var j = 0; j < map.bounds.h; j++) {
                for (var i = 0; i < map.bounds.w; i++) {
                    var cellSelectorCellEl = this.templates.cellSelectorCell({
                        index: j * map.bounds.w + i,
                        i: i * map.tileInfo.w,
                        j: j * map.tileInfo.h,
                        w: map.tileInfo.w,
                        h: map.tileInfo.h
                    });
                    this.cellSelectorEl.append(cellSelectorCellEl);
                } // end for
            } // end for

            this.cellsEl.prepend(this.cellSelectorEl);
        }
    });
});