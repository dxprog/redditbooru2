/**
 * Image view
 */
(function(undefined) {

    var $window = $(window),

        // This number helps determine the total number of columns there should be per row
        AVERAGE_COLUMN_WIDTH = 300,

        // MINUMUM WIDTH TO HEIGHT RATIO ALLOWED
        minRatio = 0.9,

        // The number of pixels between each image
        IMAGE_GUTTER = 20,

        SOURCE_UPDATE_DELAY = 250;

    RB.ImageView = Backbone.View.extend({

        templates: {
            imagesRow: RB.Templates.imagesRow,
            moreRow: RB.Templates.moreRow
        },

        collection: null,
        sources: [ 1 ], // TODO - make this not hard coded

        events: {
            'click .more-row button': 'updateImageData'
        },

        initialize: function($el, collection) {
            this.collection = collection;
            this.$el = $el;
            this.calculateWindowColumns();
            $(window).on('resize', _.bind(this.calculateWindowColumns, this));
        },

        updateImageData: function(evt) {
            var that = this;
            this.collection.fetch({
                remove: false,
                data: {
                    sources: this.sources.join(',')
                },
                processData: true,
                success: function() {
                    that.render();
                }
            });
        },

        updateSources: function(sources) {
            var currentSources = this.sources.join(','),
                newSources = sources.join(','),
                that = this;

            if (currentSources !== newSources) {
                // Wait for a bit just in case the user checks more sources
                this.sources = sources;
                clearTimeout(this._sourceUpdateTimer);
                this._sourceUpdateTimer = setTimeout(function() {
                    // Clear out the old, crufty data
                    that.collection.reset();
                    that.updateImageData();
                }, SOURCE_UPDATE_DELAY);
            }

        },

        render: function() {

            var itemsToRender = new RB.ImageCollection(),
                out = '',
                newItems = 0,
                append = false,
                $el = this.$el;

            this.collection.each(function(item) {
                
                itemsToRender.push(item);
                
                if (item.rendered) {
                    append = true;
                } else {
                    newItems++;
                    item.rendered = true;
                }

                if (itemsToRender.length === this.columns) {

                    // Only add this to the output if there were new items on this row
                    if (newItems) {
                        out = out.concat(this._drawColumn(itemsToRender));
                    }

                    itemsToRender.reset();
                    newItems = 0;
                    count = 0;
                }
            }, this);

            // Originally, at this point we'd force render the last row, but it's going to look ugly, so don't
            /*
            if (itemsToRender.length > 0) {
                out = out.concat(this._drawColumn(itemsToRender));
            }
            */

            // If there is already content on the page, we don't want to force a complete refresh on a partial
            // update, so remove the more button and the last row and append the diff
            if (append) {
                $el.find('.more-row').remove();
                $el.append(out);
            } else {
                $el.html(out);
            }

            // Slap on the more button
            $el.append(this.templates.moreRow());

        },

        /**
         * Calculates how many columns there should be and redraws if there's been a change
         */
        calculateWindowColumns: function() {
            var oldColumnCount = this.columns;
            this.width = this.$el.width();
            this.columns = Math.floor(this.width / AVERAGE_COLUMN_WIDTH);
            if (this.columns !== oldColumnCount) {
                this.width -= this.columns * IMAGE_GUTTER;
                this.render();
            }
        },

        _drawColumn: function(images) {

            var widthRatioSum = 0;

            // We're going to make some view specific changes to the data,
            // so serialize a bland copy for us to edit and pipe to the template
            images = images.toJSON();

            // Now we loop through each image in the row, get it's width to height ratio,
            // and sum them all together for later
            _.each(images, function(image) {
                image.widthHeightRatio = image.width / image.height;
                image.widthHeightRatio = image.widthHeightRatio < minRatio ? minRatio : image.widthHeightRatio;
                widthRatioSum += image.widthHeightRatio;
            });

            // Using the sum we just got, we'll figure out what percentage of the total
            // width each image should get
            _.each(images, function(image) {
                image.viewWidth = Math.round(image.widthHeightRatio / widthRatioSum * this.width);
            }, this);

            // Finally, render and return the template
            return this.templates.imagesRow(images);

        }

    });

}());