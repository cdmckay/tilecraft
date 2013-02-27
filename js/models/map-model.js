define(["underscore", "backbone"], function (_, Backbone) {

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
        insertLayerAt: function (index, layer) {
            this.get("map").insertLayerAt(index, layer);
            this.trigger("change:layers");
            this.trigger("change:layers:insert-layer", index);
        },
        removeLayerAt: function (index) {
            var layer = this.get("map").removeLayerAt(index);
            this.trigger("change:layers");
            this.trigger("change:layers:remove-layer", index);
            return layer;
        },
        setLayerNameAt: function (index, name) {
            this.get("map").layers[index].name = name;
            this.trigger("change:layers");
            this.trigger("change:layers:set-layer-name");
        },
        setLayerVisibleAt: function (index, visible) {
            this.get("map").layers[index].visible = visible;
            this.trigger("change:layers");
            this.trigger("change:layers:change-layer-visible", index, visible)
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
            this.trigger("change:tileSets:add-tileSet");
        },
        setTileSetNameAt: function (index, name) {
            this.get("map").tileSets[index].name = name;
            this.trigger("change:tileSets");
            this.trigger("change:tileSets:set-tileSet-name");
        },
        removeTileSetAt: function (index) {
            this.get("map").removeTileSetAt(index);
            this.trigger("change:tileSets");
            this.trigger("change:tileSets:remove-tileSet");
        }
    });
});
