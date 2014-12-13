/*
* Class: OpenLayers.Layer.Here
* Provides a wrapper for the Here's Maps API
* Terms of Use should follow Here's API Terms of Use.
*/
OpenLayers.Layer.Here = OpenLayers.Class(
  OpenLayers.Layer.EventPane,
  OpenLayers.Layer.FixedZoomLevels, {

    /**
    * Constant: MIN_ZOOM_LEVEL
    * {Integer} 0
    */
      MIN_ZOOM_LEVEL: 0,

    /**
    * Constant: MAX_ZOOM_LEVEL
    * {Integer} 21
    */
    MAX_ZOOM_LEVEL: 21,

    /**
    * Constant: RESOLUTIONS
    */
    RESOLUTIONS: [ 1.40625, 0.703125 ],


    /**
    * APIProperty: isBaseLayer
    * {Boolean}
    */
    isBaseLayer: true,

    /**
    * APIProperty: type
    * {HereMapStyle}
    */
    type: null,

    /**
    * APIProperty: wrapDateLine
    * {Boolean} Allow user to pan forever east/west.  Default
    * is true.
    */
    wrapDateLine: true,

    /**
    * APIProperty: sphericalMercator
    * {Boolean} Should the map act as a mercator-projected map?
    * this will cause all interactions to be in the actual map projection
    * this allows for vector drawing and overlaying other maps.
    */
    sphericalMercator: true,

    /**
    * APIProperty: Here app_id
    * {String} This will be the string of the app code
    */
    app_id: "",

    /**
    * APIProperty: Here app_code
    * {String} This will be a string of the app key
    */
    app_code: "",

    /**
    * APIProperty: useCIT See @Here API
    * {Boolean} Should the map use CIT
    */
    useCIT: true,

    /**
    * APIProperty: useTiltImages
    */
    useTiltImages: false,

    /**
    * Property: version
    * {Number} The version of the Here Maps API.
    */
    version: null,

    /**
    * Constructor: OpenLayers.Layers.Here
    *
    * Parameters:
    * name - {String} A name for the layer.
    * options - {Object} An optional object whose properties will be set
    * on the layer.
    */
    initialize: function(name, options) {
      // @todo Initialization funtion logic
      options = options || {};
      options.version = "3";
      var mixin = OpenLayers.Layer.Here["v" + options.version.replace(/\./g, "_")];
      if(mixin){
        OpenLayers.Util.applyDefaults(options, mixin);
      } else {
        throw "Unsupported Here Maps API version: " + options.version;
      }

      OpenLayers.Util.applyDefaults(options, mixin.DEFAULTS);
      if(options.maxExtent) {
        options.maxExtent = options.maxExtent.clone();
      }

      OpenLayers.Layer.EventPane.prototype.initialize.apply(this, [name, options]);
      OpenLayers.Layer.FixedZoomLevels.prototype.initialize.apply(this, [name, options]);

      if (this.sphericalMercator) {
        OpenLayers.Util.extend(this, OpenLayers.Layer.SphericalMercator);
        this.initMercatorParameters();
      }
    },

    /**
     * Method: clone
     * Create a clone of this layer
     *
     * Returns:
     * {<OpenLayers.Layer.Here>} An exact clone of this layer.
     */
     clone: function() {
      return new OpenLayers.Layer.Here(
            this.name, this.getOptions()
      );
     },

     /**
     * APIMethod: setVisibility
     * Set the visibility flag for the layer and hide/show & redraw
     *  accordingly.  Fire event unless otherwise specified.
     *
     * Note that visibility is no longer simply whether or not the layer's
     * style.display is set to "block". Now we store a visibility state
     * property on the layer class, this allows us to remember
     * whether or not we desire for the layer to be visible.
     *
     * Parameters:
     * visible - {Boolean} Display the layer (if in range)
     */
     setVisibility: function(visible) {
        // @Todo: Create the logic to control the visibility of the Here Map.
        var opacity = this.opacity == null ? 1 : this.opacity;
        OpenLayers.Layer.EventPane.prototype.setVisibility.apply(this, arguments);
        this.setOpacity(opacity);

     },

     /**
     * APIMethod: display
     * Hide or show the Layer
     *
     * Parameters:
     * visible - {Boolean}
     */
     display: function(visible) {
        // @Todo: Create display logic for showing or hidding the Here Map.
        if (!this._dragging) {
            this.setHereMapVisibility(visible);
        }
        OpenLayers.Layer.EventPane.prototype.display.apply(this, arguments);
     },

     /**
     * Method: moveTo
     *
     * Paremters:
     * bouds - {<OpenLayers.Bounds>}
     * zoomChanged - {Boolean} Tells when zoom has changed, as layers have to
     *   do some init work in that case
     * dragging - {Boolean}
     */
     moveTo: function(bounds, zoomChanged, dragging) {
        // @Todo: Move To logic to move the map to a specific location and zoom.
        this._dragging = dragging;
        OpenLayers.Layer.EventPane.prototype.moveTo.apply(this, arguments);
        delete this._dragging;
     },

     /**
     * APIMethod: setOpacity
     * Sets the opacity for the entire layer (all images)
     *
     * Parameters:
     * opacity - {Float}
     */
     setOpacity: function(opacity) {
        // @Todo: create opacity setting logic.
        if (opacity !== this.opacity) {
            if (this.map != null) {
                this.map.events.triggerEvent("changelayer", {
                    layer: this,
                    property: "opacity"
                });
                this.opacity = opacity;
            }
        }

        // We need to check other layers
            if (this.getVisibility()) {
                var container = this.getMapContainer();
                OpenLayers.Util.modifyDOMElement(
                    container, null, null, null, null, null, null, opacity
                );
            }
     },

     /**
     * APIMethod: destroy
     * Clean up this layer.
     */
     destroy: function() {
        // @Todo: Create clean up logic
        if (this.map) {
            this.setHereMapVisibility(false);
            var cache = OpenLayers.Layer.Here.cache[this.map.id];
            if (cache && cache.count <= 1) {
                this.removeHMapElements();
            }
        }
        OpenLayers.Layer.EventPane.prototype.destroy.apply(this, arguments);
     },

     /**
     * Method: removeHMapElements
     * Remove all elements added to the dom.This should only be called if
     * this is the last of the Here Layers for the given map.
     */
     removeHMapElements: function(){
      // @Todo: Clean up the Here Map left overs
      var cache = OpenLayers.Layer.Here.cache[this.map.id];
      if (cache) {
        // remove shared elements from dom
        var container = this.mapObject && this.getMapContainer();
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }

        var termsOfUse = cache.termsOfUse;
        if (termsOfUse && termsOfUse.parentNode) {
            termsOfUse.parentNode.removeChild(container);
        }

        var poweredBy = cache.poweredBy;
        if (poweredBy && poweredBy.parentNode) {
            poweredBy.parentNode.removeChild(poweredBy);
        }

        /* Not sure if Here has a method of clearing event listeners.
        if(this.mapObject && window.H && H.maps) {

        }
        */
      }
     },

     /**
     * APIMethod: removeMap
     * On being removed from the map.
     *
     * Parameters:
     * map - {<OpenLayers.Map>}
     */
     removeMap: function(map) {
        if (this.visibility && this.mapObject) {
            this.setHereMapVisibility(false);
        }
        // check to see if the last Here layer in this map
        var cache = OpenLayers.Layer.Here.cache[map.id];
        if (cache) {
            if (cache.count <= 1) {
                this.removeHMapElements();
                delete OpenLayers.Layer.Here.cache[map.id];
            } else {
                cache.count -= 1;
            }
        }
        // remove references to here map elements
        delete this.termsOfUse;
        delete this.poweredBy;
        delete this.mapObject;
        delete this.dragObject;
        OpenLayers.Layer.EventPane.prototype.removeMap.apply(this, arguments);
     },

     //
     // TRANSLATION: MapObject Bouds <-> OpenLayers.Bounds
     //

     /**
     * APIMethod: getOLBouldsFromMapObjectBounds
     *
     * Parameters:
     * moBounds - {Object}
     *
     * Returns:
     * {<OpenLayers.Bounds} An <OpenLayers.Bounds>, translated from the
     *     passed-in MapObject Bounds.
     *     Returns null if null value is passed in.
     */
     getOLBoundsFromObjectBounds: function(moBounds) {
      // // @Todo: Translation functions
      var olBounds = null;
      if (moBounds != null) {
        var sw = moBounds.getSouthWest();
        var ne = moBounds.getNorthEast();
        if(this.sphericalMercator) {
            sw = this.forwardMercator(sw.lng(), sw.lat());
            ne = this.forwardMercator(ne.lng(), ne.lat());
        } else {
            sw = new OpenLayers.LonLat(sw.lng(), sw.lat());
            ne = new OpenLayers.LonLat(ne.lng(), ne.lat());
        }
        olBounds = new OpenLayers.Bounds(sw.lon,
            sw.lat,
            ne.lon,
            ne.lat
        );
      }
      return olBounds;
     },

     /**
     * APIMethod: getWarningHTML
     *
     * Returns:
     * {String} String with information on why layer is broken,
     * and maybe how to fix it.
     */
     getWarningHTML:function() {
      // @Todo: Return the WarningHTML wrapper, or create our own to return
      return OpenLayers.i18n("hereWarning");
     },

     /****************************************
     *                                       *
     *     MapObject Interface Controls      *
     *                                       *
     *****************************************/

     // Get&Set Center, Zoom

       /**
        * APIMethod: getMapObjectCenter
        *
        * Returns:
        * {Object} The mapObject's current center in the Map Object format
        */
        getMapObjectCenter: function() {
            // @Todo: Get the Map Object's Current center position
            // console.log("getMapObjectCenter: ");
            // console.log( this.mapObject.getCenter() );
            return this.mapObject.getCenter();
        },

        /**
         * APIMethod: getMapObjectZoom
         *
         * Returns:
         * {Integer} The mapObject's current zoom, in Map Object Format
         */
         getMapObjectZoom: function() {
            // @Todo: return the current Zoom level of the Map object.
            return this.mapObject.getZoom();
         },

    /***************************************
    *                                      *
    *     MapObject Primitives             *
    *                                      *
    ***************************************/

    // LonLat

    /**
    * APIMethod: getLongitudeFromMapObjectLonLat
    *
    * Parametser:
    * moLonLat - {Object} MapObject LonLat format
    *
    * Returns:
    * {Float} Longitude of the give MapObjectLonLat
    */
    getLongitudeFromMapObjectLonLat: function(moLonLat) {
        // console.log("getLongitudeFromMapObjectLonLat: ");
        // console.log(moLonLat);
        return moLonLat;
        // @Todo: Write logic to get MapObject LonLat format.

    },

    /**
    * APIMethod: getLatitudeFromMapObjectLonLat
    *
    * Parameters:
    * moLonLat - {Object} MapObject LonLat format
    *
    * Returns:
    * {Float} Latitude of the given MapObject LonLat
    */
    getLatitudeFromMapObjectLonLat: function(moLonLat) {
        // @Todo: Write the Logic to get the Latitude of the given MapObject
         // console.log("getLatitudeFromMapObjectLonLat: ");
         // console.log(moLonLat);
        return moLonLat;
    },

    // Pixel

    /**
    * APIMethod: getXFromMapObjectPixel
    *
    * Parameters:
    * moPixel - {Object} MapObject Pixel format
    *
    * Returns:
    * {Integer} X value of the MapObject Pixel
    */
    getXFromMapObjectPixel: function(moPixel) {
        // @Todo: Write the Logic to get the X from the Map Object Pixel.
        // console.log("getXFromMapObjectPixel: ");
        // console.log(moPixel);

        return moPixel;
    },

    /**
     * APIMethod: getYFromMapObjectPixel
     *
     * Parameters:
     * moPixel - {Object} MapObject Pixel format
     *
     * Returns:
     * {Integer} Y value of the MapObject Pixel
     */
    getYFromMapObjectPixel: function(moPixel) {
        // @Todo: Write Logic to get the Y From the Map Object Pixel.
        // console.log("getYFromMapObjectPixel: ");
        // console.log(moPixel);
        return moPixel;
    },
    CLASS_NAME: "OpenLayers.Layer.Here"
  });

OpenLayers.Layer.Here.cache = {};


