define(["underscore", "backbone"], function (_, Backbone) {
    return Backbone.Model.extend({
        addLayer: function (layer) {
            this.get("map").addLayer(layer);
            this.trigger("change:layers");
        },
        insertLayerAt: function (index, layer) {
            this.get("map").insertLayerAt(index, layer);
            this.trigger("change:layers");
        },
        removeLayerAt: function (index) {
            var layer = this.get("map").removeLayerAt(index);
            this.trigger("change:layers");
            return layer;
        },
        setLayerNameAt: function (index, name) {
            this.get("map").layers[index].name = name;
            this.trigger("change:layers");
        },
        setLayerVisibleAt: function (index, visible) {
            this.get("map").layers[index].visible = visible;
            this.trigger("change:layers");
            this.trigger("change:layers-visible", index, visible)
        },
        getTileLayers: function () {
            return this.get("map").getTileLayers();
        },
        getDoodadGroups: function () {
            return this.get("map").getDoodadGroups();
        },

        addTileSet: function (tileSet) {
            this.get("map").addTileSet(tileSet);
            this.trigger("change:tileSets");
        },
        setTileSetNameAt: function (index, name) {
            this.get("map").tileSets[index].name = name;
            this.trigger("change:tileSets");
        },
        removeTileSetAt: function (index) {
            this.get("map").removeTileSetAt(index);
            this.trigger("change:tileSets");
        }
    });
});