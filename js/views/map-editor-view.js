define([
    "jquery",
    "backbone",
    "handlebars",
    "tmxjs/util/string-util"
], function (
    $,
    Backbone,
    Handlebars,
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

        /* The currently selected Cell index. */
        selectedIndex: null,

        initialize: function (options) {
            this.aggregator = options.aggregator;

            this.cellsEl = this.$(".map-editor-cells");
            this.cellSelectorEl = this.cellsEl.children(".map-editor-cell-selector");
            this.cellSelectorMarkerEl = $("<div>");
            this.generateCellSelectorCells();

            this.listenTo(this.model, "change:layers", this.render);
            this.listenTo(this.aggregator, "change:tile", this.setCellSelectorMarker);

            this.render();
        },
        render: function () {
            var map = this.model.get("map");

            this.cellSelectorEl.detach();

            this.cellsEl.empty().css({
                width: map.bounds.w * map.tileInfo.w,
                height: map.bounds.h * map.tileInfo.h
            });

            this.cellsEl.append(this.cellSelectorEl);
        },

        showCellSelector: function () {
            this.cellSelectorMarkerEl.show();
        },
        hideCellSelector: function () {
            this.cellSelectorMarkerEl.hide();
        },
        highlightCell: function (event) {
            var el = $(event.target);
            if (el.parent().hasClass("map-editor-cell-selector")) {
                var index = +el.attr("data-index");
                var cellEls = this.cellSelectorEl.children();

                this.selectedIndex = index;
                cellEls.eq(index).append(this.cellSelectorMarkerEl.detach());
            }
        },
        selectCell: function (event) {

        },
        setCellSelectorMarker: function (globalId) {
            var map = this.model.get("map");
            var tileSet = map.findTileSet(globalId);
            var tile = tileSet.tiles[globalId - tileSet.firstGlobalId];
            this.cellSelectorMarkerEl.css({
                "background": StringUtil.format(
                    "url({0}) no-repeat -{1}px -{2}px",
                    tile.imageInfo.url,
                    tile.bounds.x,
                    tile.bounds.y
                )
            });
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