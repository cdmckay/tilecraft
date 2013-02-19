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
            "click .map-editor-cell-selector": "selectCell"
        },

        aggregator: null,
        templates: {
            cellSelectorCell: Handlebars.compile($("#cell-selector-cell-template").html())
        },
        cellsEl: null,
        cellSelectorEl: null,
        cellSelectorMarkerEl: null,

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
            this.generateCellSelectorCells();

            this.listenTo(this.model, "change:layers", this.render);
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

            this.cellSelectorEl.detach();

            this.cellsEl.empty().css({
                width: map.bounds.w * map.tileInfo.w,
                height: map.bounds.h * map.tileInfo.h
            });

            this.cellsEl.append(this.cellSelectorEl);
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
            if (this.selectedLayerIndex === null) {
                return;
            }

            var el = $(event.target).parent();
            if (el.parent().hasClass("map-editor-cell-selector")) {
                debugger;
                var index = parseInt(el.attr("data-index"));

                var map = this.model.get("map");
                var layer = map.layers[this.selectedLayerIndex];
                var tile = map.findTile(this.selectedTileGlobalId);
                layer.cells[index] = new Cell(tile);
            }
        },
        generateCellSelectorCells: function () {
            var map = this.model.get("map");
            for (var j = 0; j < map.bounds.h; j++) {
                for (var i = 0; i < map.bounds.w; i++) {
                    var cellSelectorCellEl = this.templates.cellSelectorCell({
                        index: j * map.bounds.w + i,
                        x: i * map.tileInfo.w,
                        y: j * map.tileInfo.h,
                        w: map.tileInfo.w,
                        h: map.tileInfo.h
                    });
                    this.cellSelectorEl.append(cellSelectorCellEl);
                } // end for
            } // end for
        }
    });
});