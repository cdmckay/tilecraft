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
            "click .tile-set-manager-toolbar-add-button": "addTileSet"
        },

        editorView: null,

        initialize: function () {
            this.listenTo(this.model, "change:tileSets", this.render);
        },
        render: function () {
            alert("A TileSet was added");
        },

        addTileSet: function () {
            var view = this;
            var map = this.model.get("map");
            var tileSet = new TileSet(map.getMaxGlobalId() + 1);
            tileSet.tileInfo.w = map.tileInfo.w;
            tileSet.tileInfo.h = map.tileInfo.h;
            tileSet.imageInfo.url = "http://i.imgur.com/Sj89E15.png";
            this.editorView = new TileSetEditorView({
                model: new TileSetModel({
                    tileSet: tileSet
                })
            });
            this.editorView.open()
                .done(function (tileSetModel) {
                    view.model.addTileSet(tileSetModel.get("tileSet"));
                });
        }
    });
});