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
        setLayerVisibleAt: function (index, visible) {
            this.get("map").layers[index].visible = visible;
            this.trigger("change:layers");
        },
        getTileLayers: function () {
            return this.get("map").getTileLayers();
        },
        getDoodadGroups: function () {
            return this.get("map").getDoodadGroups();
        }
    });
});