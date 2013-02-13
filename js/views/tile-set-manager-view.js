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
            "click .tile-set-manager-toolbar-add-button": "addTileSet"
        },

        templates: {
            tileSetsOption: Handlebars.compile($("#tile-sets-option-template").html())
        },
        editorView: null,
        tileSetsSelectEl: null,
        renameButtonEl: null,

        initialize: function () {
            this.editorView = new TileSetEditorView();
            this.tileSetsSelectEl = this.$(".tile-set-manager-tile-sets");
            this.renameButtonEl = this.$(".tile-set-manager-rename-button");

            this.listenTo(this.model, "change:tileSets", this.render);
        },
        render: function () {
            var view = this;
            var tileSets = this.model.get("map").tileSets;

            this.tileSetsSelectEl.empty();
            $.each(tileSets, function (i) {
                var tileSetOption = $(view.templates.tileSetsOption({
                    index: i,
                    name: this.name
                }));
                view.tileSetsSelectEl.append(tileSetOption);
            });

            if (tileSets.length) {
                this.renameButtonEl.removeAttr("disabled");
            } else {
                this.renameButtonEl.attr("disabled", "disabled");
            }

            return this;
        },

        addTileSet: function () {
            var view = this;
            var map = this.model.get("map");
            var tileSet = new TileSet(map.getMaxGlobalId() + 1);
            tileSet.tileInfo.w = map.tileInfo.w;
            tileSet.tileInfo.h = map.tileInfo.h;
            tileSet.imageInfo.url = "http://i.imgur.com/Sj89E15.png";
            this.editorView.model = new TileSetModel({ tileSet: tileSet });
            this.editorView
                .open()
                .done(function (tileSetModel) {
                    view.model.addTileSet(tileSetModel.get("tileSet"));
                });

        },
        renameTileSet: function () {
            var index = this.tileSetsSelectEl.val();
            var name = this.model.get("map").tileSets[index].name;
            var result = prompt('Please enter the new Tile Set name:', name);
            if (result !== null) {
                this.model.setTileSetNameAt(index, result);
            }
        }
    });
});