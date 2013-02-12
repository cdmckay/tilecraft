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
        initialize: function () {
        },
        render: function () {
        },

        editorView: null,
        addTileSet: function () {
            var mapTileInfo = this.model.get("map").tileInfo;
            var tileSet = new TileSet();
            tileSet.tileInfo.w = mapTileInfo.w;
            tileSet.tileInfo.h = mapTileInfo.h;
            this.editorView = new TileSetEditorView({
                model: new TileSetModel({
                    tileSet: tileSet
                })
            });
            this.editorView.open()
                .done(function (tileSetModel) {
                    alert("Added TileSet: " + tileSetModel.get("tileSet").name);
                })
                .fail(function () {
                    alert("No TileSet added");
                })
        }
    });
});