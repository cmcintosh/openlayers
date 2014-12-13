/**
* @require OpenLayers/Layer/Here.js
*/

/**
* Constant: OpenLayers.Layer.Here.v3
*
* Mixin providing functionality specific to Here Maps API v3
*
* To use this layer, you must include the Here Maps v3 API in your HTML
* To match Here's zoom animation better with
* OpenLayers animated zooming, configure your map with a zoomDuration of 10
*
* (code)
* new OpenLayers.Map('map', {zoomDuration: 10});
* (end)
*
* Much of this code was borrowed from the Google Maps implementation.
*
*/

OpenLayers.Layer.Here.v3 = {

  /**
  * Constant: DEFAULS
  * {object} It is not recommended to change the properties here.
  */
  DEFAULTS: {
    sphericalMercator: true,
    projection: "EPSG:900913", /* @Note: We will need to experiment with this */
  },

  /**
  * APIProperty: animationEnabled
  * {Boolean} If set to true, the transition between zoom levels will be animated
  * if supported by Here Maps API
  *
  */
  animationEnabled: true,

  /**
  * Method: loadMapObject
  * Load the Hear Map and register the appropiate event listeners.
  */
  loadMapObject: function() {
    // @todo: Logic for loading the map object
    if (!this.type) {

    }
    var mapObject;
    var cache = OpenLayers.Layer.Here.cache[this.map.id];
    if (cache) {
      mapObject = cache.mapObject;
      // increment the layer count
      ++cache.count;
    } else {
      // This is the first Here Map layer
      // create Here Map
      var center = this.map.getCenter();
      var container = document.createELement('div');
      container.className = "olForeignContainer";
      container.style.width = "100%";
      container.style.height = "100%";

      var platform = new H.service.Platform({
        app_id: 'DemoAppId01082013GAL',
          app_code: 'AJKnXv84fjrb0KIHawS0Tg',
          useCIT: true
      });
      var defaultLayers = platform.createDefaultLayers();

      console.log(this.type);

      //Step 2: initialize a map  - not specificing a location will give a whole world view.
      mapObject = new H.Map(container, defaultLayers.normal.map);

      //Step 3: make the map interactive
      // MapEvents enables the event system
      // Behavior implements default interactions for pan/zoom (also on mobile touch environments)
      var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

      // Create the default UI components
      var ui = H.ui.UI.createDefault(map, defaultLayers);

    }
  },

  /**
  * APIMethod: onMapResize
  */
  onMapResize: function() {
    if(this.visibility) {
     /** @todo: Find Here's Resize event and trigger it */
    }
  },

  /**
  * Method: setHMapVisibility
  * Display bhe Here Map container and associated elements.
  *
  * Parameters:
  * visible - {Boolean} Display the Here elements.
  */
  setHereMapVisibility: function(visible) {
    /** @todo finish the code here */

  },

  /**
  * Method: getMapContainer
  *
  * Returns:
  * {DOMElement} the Here Map's container div
  */
  getMapContainer: function() {
    // @todo: Logic for getting the Map Container
  },

  //
  // TRANSLATION: MapObject Bounds <-> OpenLayers.Bounds
  //

  /**
     * APIMethod: getMapObjectBoundsFromOLBounds
     *
     * Parameters:
     * olBounds - {<OpenLayers.Bounds>}
     *
     * Returns:
     * {Object} A MapObject Bounds, translated from olBounds
     *          Returns null if null value is passed in
     */
    getMapObjectBoundsFromOLBounds: function(olBounds) {
        // @todo: Logic to return the Object Bounds.
        return null;
    },

    /************************************
     *                                  *
     *   MapObject Interface Controls   *
     *                                  *
     ************************************/


  // LonLat - Pixel Translation

    /**
     * APIMethod: getMapObjectLonLatFromMapObjectPixel
     *
     * Parameters:
     * moPixel - {Object} MapObject Pixel format
     *
     * Returns:
     * {Object} MapObject LonLat translated from MapObject Pixel
     */
    getMapObjectLonLatFromMapObjectPixel: function(moPixel) {
        // @todo: This may work, but we stole it from the gmap implementation so it probably will not.
       return null;
    },

   /**
     * APIMethod: getMapObjectPixelFromMapObjectLonLat
     *
     * Parameters:
     * moLonLat - {Object} MapObject LonLat format
     *
     * Returns:
     * {Object} MapObject Pixel transtlated from MapObject LonLat
     */
    getMapObjectPixelFromMapObjectLonLat: function(moLonLat) {
        // @todo: Logic of Pixels translation from MapObject LonLat
        return null;
    },

   /**
     * APIMethod: setMapObjectCenter
     * Set the mapObject to the specified center and zoom
     *
     * Parameters:
     * center - {Object} MapObject LonLat format
     * zoom - {int} MapObject zoom format
     */
    setMapObjectCenter: function(center, zoom) {
      return null;
    },


  // Bounds

    /**
     * APIMethod: getMapObjectZoomFromMapObjectBounds
     *
     * Parameters:
     * moBounds - {Object} MapObject Bounds format
     *
     * Returns:
     * {Object} MapObject Zoom for specified MapObject Bounds
     */
    getMapObjectZoomFromMapObjectBounds: function(moBounds) {
        return null;
    },

    /************************************
     *                                  *
     *       MapObject Primitives       *
     *                                  *
     ************************************/


  // LonLat

    /**
     * APIMethod: getMapObjectLonLatFromLonLat
     *
     * Parameters:
     * lon - {Float}
     * lat - {Float}
     *
     * Returns:
     * {Object} MapObject LonLat built from lon and lat params
     */
    getMapObjectLonLatFromLonLat: function(lon, lat) {
       return null;
    },

  // Pixel

    /**
     * APIMethod: getMapObjectPixelFromXY
     *
     * Parameters:
     * x - {Integer}
     * y - {Integer}
     *
     * Returns:
     * {Object} MapObject Pixel from x and y parameters
     */
    getMapObjectPixelFromXY: function(x, y) {
        return null;
    },

};
