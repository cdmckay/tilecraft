define(["backbone"], function (Backbone) {
    return Backbone.Model.extend({
        setName: function (name) {
            this.get("tileSet").name = name;
            this.trigger("change:name");
        },
        setImageURL: function (imageURL) {
            this.get("tileSet").imageInfo.url = imageURL;
            this.trigger("change:imageInfo");
        },
        setTileWidth: function (tileWidth) {
            this.get("tileSet").tileInfo.w = parseInt(tileWidth);
            this.trigger("change:tileInfo");
        },
        setTileHeight: function (tileHeight) {
            this.get("tileSet").tileInfo.h = parseInt(tileHeight);
            this.trigger("change:tileInfo");
        },
        setTileMargin: function (tileMargin) {
            this.get("tileSet").tileInfo.margin = parseInt(tileMargin);
            this.trigger("change:tileInfo");
        },
        setTileSpacing: function (tileSpacing) {
            this.get("tileSet").tileInfo.spacing = parseInt(tileSpacing);
            this.trigger("change:tileInfo");
        }
    });
});