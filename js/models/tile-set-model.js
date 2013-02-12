define(["backbone"], function (Backbone) {
    return Backbone.Model.extend({
        setName: function (name) {
            this.get("tileSet").name = name;
            this.trigger("change:tileSet");
        },
        setImageURL: function (imageURL) {
            this.get("tileSet").imageInfo.url = imageURL;
            this.trigger("change:tileSet");
        },
        setTileWidth: function (tileWidth) {
            this.get("tileSet").tileInfo.w = tileWidth;
            this.trigger("change:tileSet");
        },
        setTileHeight: function (tileHeight) {
            this.get("tileSet").tileInfo.h = tileHeight;
            this.trigger("change:tileSet");
        },
        setTileMargin: function (tileMargin) {
            this.get("tileSet").tileInfo.margin = tileMargin;
            this.trigger("change:tileSet");
        },
        setTileSpacing: function (tileSpacing) {
            this.get("tileSet").tileInfo.h = tileSpacing;
            this.trigger("change:tileSet");
        }
    });
});