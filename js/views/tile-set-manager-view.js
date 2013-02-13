define([
    "jquery",
    "backbone",
    "tmxjs/tile-set",
    "../models/tile-set-model",
    "../views/tile-set-editor-view"
], function (
    $,
    Backbone,
    TileSet,
    TileSetModel,
    TileSetEditorView
) {
    return Backbone.View.extend({
        events: {
            "click .tile-set-manager-rename-button": "renameTileSet",
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

        initialize: function () {
            this.editorView = new TileSetEditorView();
            this.tileSetsEl = this.$(".tile-set-manager-tile-sets");
            this.renameButtonEl = this.$(".tile-set-manager-rename-button");
            this.tileSelectorEl = this.$(".tile-set-manager-tile-selector");

            this.listenTo(this.model, "change:tileSets", this.render);
        },
        render: function () {
            var view = this;
            var tileSets = this.model.get("map").tileSets;

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
            var index = this.tileSetsEl.val();
            if (index !== null) {
                var tileSet = tileSets[index];
                $.each(tileSet.tiles, function (i, tile) {
                    var tileSetTileEl = $(view.templates.tileSetsTile({
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

        renameTileSet: function () {
            var index = this.tileSetsEl.val();
            var name = this.model.get("map").tileSets[index].name;
            var result = prompt('Please enter the new Tile Set name:', name);
            if (result !== null && result !== "") {
                this.model.setTileSetNameAt(index, result);
            }
        },
        addTileSet: function () {
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
                });

        },
        removeTileSet: function () {
            var index = this.tileSetsEl.val();
            if (index !== null) {
                this.model.removeTileSetAt(index);
            }
        }
    });
});