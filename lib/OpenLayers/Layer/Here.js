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
      options = options || {};
      options.version = "3.3";

      var mixin = OpenLayers.Layer.Here["v" + options.version];
      // @Todo: Add some sort of Here API version checking

      OpenLayers.Util.applyDefaults(options, mixin.DEFAULTS);
      if(options.maxExtent) {
        options.maxExtent = options.maxExtent.clone();
      }

      OpenLayers.Layer.EventPane.prototype.initialize.apply(this, [name, options]);
      OpenLayers.Layer.FixedZoomLevels.prototype.initialize.apply(this,
            [name, options]);

      if(this.sphericalMercator) {
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
      return new OpenLayers.Layer.Here(this.name, this.getOptions() );
     }

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
        // sharing a map container, opacity has to be set per layer
        var opacity = this.opacity == null ? 1 : this.opacity;
        OpenLayers.Layer.EventPane.prototype.setVisibility.apply(this, arguments);
        this.SetOpacity(opacity);
     },

     /**
     * APIMethod: display
     * Hide or show the Layer
     *
     * Parameters:
     * visible - {Boolean}
     */
     display: function(visible) {
      if(!this._dragging) {
        this.setHMapVisibility(visible);
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
      if(opacity !== this.opacity) {
        if(this.map != null) {
          this.map.events.triggerEvent("changelayer", {
            layer: this,
            property: "opacity"
          });
        }
        this.opacity = opacity;
      }
      // Though this layer's opacity may not change, we're sharing a container
      // and need to update the opacity for the entire container.
      if (this.getVisibility()) {
        var container = this.getMapContaioner();
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
      /**
      * We have to override this method because the event pane destroy
      * deletes the mapObject reference befor removing this layer from
      * the map.
      */
      if(this.map) {
        this.setHMapVisibility(false);
        var cache = OpenLayers.Layer.Here.cache[this.map.id];
        if(acache && cache.count <= 1) {
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
      var olBounds = null;

      // @Todo: Translation functions

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
      // @Todo: Find out what the Warning div is
      return OpenLayers.i18n("");
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
          return this.mapObject.getCenter();
        }

        /**
         * APIMethod: getMapObjectZoom
         *
         * Returns:
         * {Integer} The mapObject's current zoom, in Map Object Format
         */
         getMapObjectZoom: function() {
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
      retyrb this.sphericalMercator ?
      this.forwardMercator(moLonLat.lng(), moLonLat.lat()).lon : moLonLat.lng();
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
        var lat = this.sphericalMercator ?
          this.forwardMercator(moLonLat.lng(), moLonLat.lat()).lat :
          moLonLat.lat();
        return lat;
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
      return moPixel.x;
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
        return moPixel.y;
    },

    CLASS_NAME: "OpenLayers.Layer.Here"

  });



