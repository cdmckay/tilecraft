define([
    "jquery",
    "backbone"
], function (
    $,
    Backbone
) {
    return Backbone.View.extend({
        el: "#tile-set-editor",
        events: {
            "submit form": "submit",
            "click #tile-set-editor-cancel-button": "cancel"
        },

        /* The form elements. */
        formEls: {},

        /* The Deferred that eventually returns a TileSetModel or null. */
        deferred: null,

        /* The form validator. */
        validator: null,

        initialize: function () {
            this.formEls.name = this.$("#tile-set-editor-name");
            this.formEls.imageURL = this.$("#tile-set-editor-image-url");
            this.formEls.tileWidth = this.$("#tile-set-editor-tile-width");
            this.formEls.tileHeight = this.$("#tile-set-editor-tile-height");
            this.formEls.tileMargin = this.$("#tile-set-editor-tile-margin");
            this.formEls.tileSpacing = this.$("#tile-set-editor-tile-spacing");

            this.validator = this.$("form").validate({
                rules: {
                    "tile-set-editor-name": "required",
                    "tile-set-editor-image-url": {
                        required: true,
                        url: true
                    },
                    "tile-set-editor-tile-width": {
                        required: true,
                        min: 1
                    },
                    "tile-set-editor-tile-height": {
                        required: true,
                        min: 1
                    },
                    "tile-set-editor-tile-margin": {
                        required: true,
                        min: 0
                    },
                    "tile-set-editor-tile-spacing": {
                        required: true,
                        min: 0
                    }
                },
                onsubmit: false,
                showErrors: function () {
                    this.defaultShowErrors();
                    $.colorbox.resize();
                }
            });
        },

        open: function () {
            var tileSet = this.model.get("tileSet");
            this.formEls.name.val(tileSet.name);
            this.formEls.imageURL.val(tileSet.imageInfo.url);
            this.formEls.tileWidth.val(tileSet.tileInfo.w);
            this.formEls.tileHeight.val(tileSet.tileInfo.h);
            this.formEls.tileMargin.val(tileSet.tileInfo.margin);
            this.formEls.tileSpacing.val(tileSet.tileInfo.spacing);

            $.colorbox({
                inline: true,
                href: this.el,
                title: "New Tile Set",
                overlayClose: false,
                transition: "none",
                onClosed: function () {
                    // This is to fix a bug with Colorbox where the second time it opens it incorrectly sizes
                    // the cboxLoadedContent div. This may be side-effect of using box-sizing: border-box.
                    $.colorbox.remove();
                }
            });

            this.deferred = $.Deferred();
            return this.deferred.promise();
        },
        submit: function () {
            if (this.validator.form()) {
                this.model.setName(this.formEls.name.val());
                this.model.setImageURL(this.formEls.imageURL.val());
                this.model.setTileWidth(this.formEls.tileWidth.val());
                this.model.setTileHeight(this.formEls.tileHeight.val());
                this.model.setTileMargin(this.formEls.tileMargin.val());
                this.model.setTileSpacing(this.formEls.tileSpacing.val());

                $.colorbox.close();
                this.deferred.resolve(this.model);
            }
            return false;
        },
        cancel: function () {
            $.colorbox.close();
            this.deferred.reject();
        }
    });
});