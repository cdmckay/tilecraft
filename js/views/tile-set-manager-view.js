define([
    "jquery",
    "backbone",
    "handlebars",
    "tmxjs/tile-set",
    "../models/tile-set-model",
    "../views/tile-set-editor-view"
], function (
    $,
    Backbone,
    Handlebars,
    TileSet,
    TileSetModel,
    TileSetEditorView
) {
    return Backbone.View.extend({
        events: {
            "click .tile-set-manager-tile-selector": "selectTile",
            "click .tile-set-manager-rename-button": "renameTileSet",
            "change tile-set-manager-tile-sets": "selectTileSet",
            "click .tile-set-manager-toolbar-add-button": "addTileSet",
            "click .tile-set-manager-toolbar-remove-button": "removeTileSet"
        },

        templates: {
            tileSetsOption: Handlebars.compile($("#tile-sets-option-template").html()),
            tileSetsTile: Handlebars.compile($("#tile-sets-tile-template").html())
        },
        editorView: null,
        tileSetsEl: null,
        renameButtonEl: null,
        tileSelectorEl: null,

        /* The currently selected TileSet index. */
        selectedTileSetIndex: null,

        /* The currently selected Tile in the TileSet index. */
        selectedTileIndex: null,

        initialize: function () {
            this.editorView = new TileSetEditorView();
            this.tileSetsEl = this.$(".tile-set-manager-tile-sets");
            this.renameButtonEl = this.$(".tile-set-manager-rename-button");
            this.tileSelectorEl = this.$(".tile-set-manager-tile-selector");

            this.listenTo(this.model, "change:tileSets", this.render);

            var tileSets = this.model.get("map").tileSets;
            if (tileSets) {
                this.render();
            }
        },
        render: function () {
            var view = this;
            var tileSets = this.model.get("map").tileSets;

            // This is for the case where a TileSet has been added via the model.
            if (this.selectedTileSetIndex === null && tileSets.length) {
                this.selectedTileSetIndex = 0;
            }

            this.tileSetsEl.empty();
            $.each(tileSets, function (i) {
                var tileSetOptionEl = $(view.templates.tileSetsOption({
                    index: i,
                    name: this.name
                }));
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
                        url: tile.imageInfo.url
                    }));
                    view.tileSelectorEl.append(tileSetTileEl);
                });
            }

            return this;
        },

        selectTileSet: function (event) {
            var index = this.tileSetsEl.val();
            this.selectedTileSetIndex = index;
            this.render();
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
                    view.model.addTileSet(tileSetModel.get("tileSet"));
                    view.selectedTileSetIndex = map.tileSets.length - 1;
                });

        },
        removeTileSet: function (event) {
            var index = this.selectedTileSetIndex;
            if (index !== null) {
                this.model.removeTileSetAt(index);
                var tileSetCount = this.model.get("map").tileSets.length;
                this.selectedTileSetIndex = tileSetCount === 0 ? null : Math.min(index, tileSetCount - 1);
            }
        },
        selectTile: function (event) {
            var el = $(event.target);
            if (el.parent().hasClass("tile-set-manager-tile-selector")) {
                var tileIndex = +el.attr("data-index");
                var tileEls = this.tileSelectorEl.children();

                // Remove old selected if it exists.
                if (this.selectedTileIndex !== null) {
                    tileEls.eq(this.selectedTileIndex).empty();
                }

                var tileSelectorMarkerEl = $("<div>");
                tileEls.eq(tileIndex).append(tileSelectorMarkerEl);
                this.selectedTileIndex = tileIndex;
            }
        }
    });
});