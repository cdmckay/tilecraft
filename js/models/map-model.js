define(["backbone"], function (Backbone) {
    return Backbone.Model.extend({
        getBounds: function () {
            return this.get("map").bounds;
        },
        addLayer: function (layer) {
            this.get("map").addLayer(layer);
            this.trigger("layer:added");
        },
        insertLayerAt: function (index, layer) {
            this.get("map").insertLayerAt(index, layer);
            this.trigger("layer:added");
        },
        removeLayerAt: function (index) {
            var layer = this.get("map").removeLayerAt(index);
            this.trigger("layer:removed");
            return layer;
        },
        setLayerVisibleAt: function (index, visible) {
            this.get("map").layers[index].visible = visible;
            this.trigger("layer:changed");
        },
        getLayers: function () {
            return this.get("map").layers;
        },
        getTileLayers: function () {
            return this.get("map").getTileLayers();
        },
        getDoodadGroups: function () {
            return this.get("map").getDoodadGroups();
        }
    });
});