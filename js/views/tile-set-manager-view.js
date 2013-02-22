define([
    "jquery",
    "backbone",
    "handlebars",
    "tmxjs/tile-set",
    "tmxjs/util/util",
    "../models/tile-set-model",
    "../views/tile-set-editor-view"
], function (
    $,
    Backbone,
    Handlebars,
    TileSet,
    Util,
    TileSetModel,
    TileSetEditorView
) {
    return Backbone.View.extend({
        events: {
            "click .tile-set-manager-tile-selector": "selectTile",
            "click .tile-set-manager-rename-button": "renameTileSet",
            "change .tile-set-manager-tile-sets": "selectTileSet",
            "click .tile-set-manager-toolbar-add-button": "addTileSet",
            "click .tile-set-manager-toolbar-remove-button": "removeTileSet"
        },

        aggregator: null,
        templates: {
            tileSetsOption: Handlebars.compile($("#tile-sets-option-template").html()),
            tileSetsTile: Handlebars.compile($("#tile-sets-tile-template").html())
        },
        editorView: null,
        tileSetsEl: null,
        renameButtonEl: null,
        tileSelectorEl: null,
        tileSelectorMarkerEl: null,

        /* The currently selected TileSet index. */
        selectedTileSetIndex: null,

        /* The currently selected Tile index. */
        selectedTileIndex: null,

        initialize: function (options) {
            this.aggregator = options.aggregator;

            this.editorView = new TileSetEditorView();
            this.tileSetsEl = this.$(".tile-set-manager-tile-sets");
            this.renameButtonEl = this.$(".tile-set-manager-rename-button");
            this.tileSelectorEl = this.$(".tile-set-manager-tile-selector");
            this.tileSelectorMarkerEl = $("<div>");

            this.listenTo(this.model, "change:map", this.indexTileSets);
            this.listenTo(this.model, "change:tileSets", this.indexTileSets);

            var tileSets = this.model.get("map").tileSets;
            if (tileSets) {
                this.indexTileSets();
            }
        },
        render: function () {
            var view = this;
            var tileSets = this.model.get("map").tileSets;

            this.tileSetsEl.empty();
            $.each(tileSets, function (ti, tileSet) {
                var tileSetOptionEl = $(view.templates.tileSetsOption({
                    index: ti,
                    name: tileSet.name
                }));
                if (ti === view.selectedTileSetIndex) {
                    tileSetOptionEl.attr("selected", "selected");
                }
                view.tileSetsEl.append(tileSetOptionEl);
            });

            if (tileSets.length) {
                this.renameButtonEl.removeAttr("disabled");
            } else {
                this.renameButtonEl.attr("disabled", "disabled");
            }

            this.tileSelectorEl.empty();
            if (this.selectedTileSetIndex !== null) {
                var tileSet = tileSets[this.selectedTileSetIndex];
                $.each(tileSet.tiles, function (i, tile) {
                    var tileSetTileEl = $(view.templates.tileSetsTile({
                        index: i,
                        x: tile.bounds.x,
                        y: tile.bounds.y,
                        w: tile.bounds.w,
                        h: tile.bounds.h,
                        url: Util.urlFor(tile.imageInfo.source, view.model.get("dir"))
                    }));
                    view.tileSelectorEl.append(tileSetTileEl);
                });
            }

            return this;
        },

        indexTileSets: function () {
            var tileSets = this.model.get("map").tileSets;
            var newTileSetIndex = this.selectedTileSetIndex;
            var newTileIndex = this.selectedTileIndex;

            // Make sure the indices are within bounds.
            if (tileSets.length) {
                if (this.selectedTileSetIndex === null) newTileSetIndex = 0;
                if (this.selectedTileSetIndex >= tileSets.length) newTileSetIndex = tileSets.length - 1;
                if (this.selectedTileIndex >= tileSets[newTileSetIndex].tiles.length) newTileIndex = null;
            } else {
                if (this.selectedTileSetIndex !== null) newTileSetIndex = null;
                if (this.selectedTileIndex !== null) newTileIndex = null;
            }

            // If they changed, update them and notify.
            if (newTileSetIndex !== this.selectedTileSetIndex) {
                this.selectedTileSetIndex = newTileSetIndex;
                this.aggregator.trigger("change:select-tileSet", newTileSetIndex);
            }
            if (newTileIndex !== this.selectedTileIndex) {
                this.selectedTileIndex = newTileIndex;
                this.aggregator.trigger("change:select-tile", newTileIndex);
            }

            this.render();
        },
        selectTileSet: function (event) {
            var index = parseInt(this.tileSetsEl.val());
            if (index !== this.selectedTileSetIndex) {
                this.selectedTileSetIndex = index;
                this.selectedTileIndex = null;
                this.aggregator.trigger("change:select-tileSet", index);
                this.aggregator.trigger("change:select-tile", null);
                this.render();
            }
        },
        renameTileSet: function (event) {
            var index = this.selectedTileSetIndex;
            var name = this.model.get("map").tileSets[index].name;
            var result = prompt('Please enter the new Tile Set name:', name);
            if (result !== null && result !== "") {
                this.model.setTileSetNameAt(index, result);
            }
        },
        addTileSet: function (event) {
            var view = this;
            var map = this.model.get("map");
            var tileSet = new TileSet(map.getMaxGlobalId() + 1);
            tileSet.tileInfo.w = map.tileInfo.w;
            tileSet.tileInfo.h = map.tileInfo.h;
            this.editorView.model = new TileSetModel({ tileSet: tileSet });
            this.editorView
                .open()
                .done(function (tileSetModel) {
                    view.selectedTileSetIndex = map.tileSets.length;
                    view.model.addTileSet(tileSetModel.get("tileSet"));
                });

        },
        removeTileSet: function (event) {
            var index = this.selectedTileSetIndex;
            if (index !== null) {
                this.model.removeTileSetAt(index);
            }
        },
        selectTile: function (event) {
            var el = $(event.target);
            if (el.parent().hasClass("tile-set-manager-tile-selector")) {
                var tileIndex = parseInt(el.attr("data-index"));
                var tileEls = this.tileSelectorEl.children();

                this.selectedTileIndex = tileIndex;
                tileEls.eq(tileIndex).append(this.tileSelectorMarkerEl.detach());

                // Trigger event in the aggregator.
                var map = this.model.get("map");
                var tileSet = map.tileSets[this.selectedTileSetIndex];
                var globalId = tileSet.firstGlobalId + tileIndex;
                this.aggregator.trigger("change:select-tile", globalId);
            }
        }
    });
});