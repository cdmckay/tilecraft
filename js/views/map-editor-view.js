define([
    "jquery",
    "backbone",
    "handlebars"
], function (
    $,
    Backbone,
    Handlebars
) {
    return Backbone.View.extend({
        events: {
            "mouseover .map-editor-cell-selector": "highlightCell",
            "click .map-editor-cell-selector": "selectCell"
        },

        templates: {
            cellSelectorCell: Handlebars.compile($("#cell-selector-cell-template").html())
        },
        cellsEl: null,

        /* The currently selected Cell index. */
        selectedIndex: null,

        initialize: function () {
            this.cellsEl = this.$(".map-editor-cells");
            this.cellSelectorEl = this.cellsEl.children(".map-editor-cell-selector");
            this.generateCellSelectorCells();

            this.listenTo(this.model, "change:layers", this.render);

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

        highlightCell: function (event) {
            var el = $(event.target);
            if (el.parent().hasClass("map-editor-cell-selector")) {
                var index = +el.attr("data-index");
                var cellEls = this.cellSelectorEl.children();

                // Remove old selected if it exists.
                if (this.selectedIndex !== null) {
                    cellEls.eq(this.selectedIndex).empty();
                }

                var cellSelectorMarkerEl = $("<div>");
                cellEls.eq(index).append(cellSelectorMarkerEl);
                this.selectedIndex = index;
            }
        },
        selectCell: function (event) {

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