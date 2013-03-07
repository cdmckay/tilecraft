define(["backbone"], function (Backbone) {
    return Backbone.Model.extend({
        initialize: function (options) {
            this.urlRoot = options.urlRoot;
            this.on("change:map", function () {
                this.set("id", options.id || this.generateGuid());
            });
        },
        toJSON: function () {
            var doc = this.get("map").toXML();
            var xmlString = doc.context.xml || new XMLSerializer().serializeToString(doc.context);
            return {
                id: this.id,
                xml: xmlString
            };
        },

        generateGuid: function () {
            // Adapted from:
            // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },
        addLayer: function (layer) {
            var index = this.get("map").addLayer(layer);
            this.trigger("change:layers");
            this.trigger("change:layers:insert-layer", index);
        },
        insertLayerAt: function (index, layer) {
            this.get("map").insertLayerAt(index, layer);
            this.trigger("change:layers");
            this.trigger("change:layers:insert-layer", index);
        },
        raiseLayerAt: function (index) {
            var map = this.get("map");
            var layer = map.removeLayerAt(index);
            map.insertLayerAt(index + 1, layer);
            this.trigger("change:layers");
            this.trigger("change:layers:raise-layer", index);
        },
        lowerLayerAt: function (index) {
            var map = this.get("map");
            var layer = map.removeLayerAt(index);
            map.insertLayerAt(index - 1, layer);
            this.trigger("change:layers");
            this.trigger("change:layers:lower-layer", index);
        },
        removeLayerAt: function (index) {
            var layer = this.get("map").removeLayerAt(index);
            this.trigger("change:layers");
            this.trigger("change:layers:remove-layer", index);
            return layer;
        },
        getLayerAt: function (index) {
            return this.get("map").layers[index];
        },
        getLayerNameAt: function (index) {
            return this.getLayerAt(index).name;
        },
        setLayerNameAt: function (index, name) {
            this.getLayerAt(index).name = name;
            this.trigger("change:layers");
            this.trigger("change:layers:set-layer-name", index, name);
        },
        getLayerVisibleAt: function (index) {
            return this.getLayerAt(index).visible;
        },
        setLayerVisibleAt: function (index, visible) {
            this.getLayerAt(index).visible = visible;
            this.trigger("change:layers");
            this.trigger("change:layers:set-layer-visible", index, visible)
        },
        getLayers: function () {
            return this.get("map").layers;
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
            this.trigger("change:tileSets:add-tileSet", tileSet);
        },
        setTileSetNameAt: function (index, name) {
            this.get("map").tileSets[index].name = name;
            this.trigger("change:tileSets");
            this.trigger("change:tileSets:set-tileSet-name", index, name);
        },
        removeTileSetAt: function (index) {
            this.get("map").removeTileSetAt(index);
            this.trigger("change:tileSets");
            this.trigger("change:tileSets:remove-tileSet", index);
        },

        setCellAt: function (layerIndex, index, cell) {
            this.getLayerAt(layerIndex).cells[index] = cell;
            this.trigger("change:cells");
            this.trigger("change:cells:set-cell", layerIndex, index, cell);
        }
    });
});
