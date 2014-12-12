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
*
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

    var platform = new H.service.Platform();
    var defaultLayers = platform.createDefaultLayers();


    if(!this.type) {
      this.type = defaultLayers.normal.map;
    }
    var mapObject;
    var cache = OpenLayers.Layer.Here.cache[this.map.id];
    if (cache) {
      // there are already google layers added to this map
      mapObject = cache.mapObject;
      // increment the layer count
      ++cache.count;
    } else {

      // This is the first Here Map layer for this map
      // create Here Map
      var center = this.map.getCenter();
      var container = document.createElement('div');
      container.className = 'olForeignContainer';
      container.style.width = "100%";
      container.style.height = "100%";
      mapObject = new H.Map(container, defaultLayers.normal.map, {
        center: center ? new H.geo.Point(center.lat, center.lon) : new H.geo.Point(0, 0),
        zoom: this.map.getZoom() || 0,
        /* @Todo: Investigate how Here handles: other engines you can disable the default UI and set the map type/style here */
      });

      // Create the controls

      // @todo investigate how to do this with Here

    }

    this.mapObject = mapObject;
    this.setHMapVisibility(this.visibility);
  },

  /**
  * APIMethod: onMapResize
  */
  onMapResize: function() {
    if(this.visibility) {
     /** @todo: Find Here's Resize event and trigger it
    }
  }

  /**
  * Method: setHMapVisibility
  * Display bhe Here Map container and associated elements.
  *
  * Parameters:
  * visible - {Boolean} Display the Here elements.
  */
  setHMapVisibility: function(visible) {
    /** @todo finish the code here */
  },

  /**
  * Method: getMapContainer
  *
  * Returns:
  * {DOMElement} the Here Map's container div
  */
  getMapContainer: function() {
    // I believe this should work.
      return this.mapObject.getDiv();
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
        var moBounds = null;
        if (olBounds != null) {
            var sw = this.sphericalMercator ?
              this.inverseMercator(olBounds.bottom, olBounds.left) :
              new OpenLayers.LonLat(olBounds.bottom, olBounds.left);
            var ne = this.sphericalMercator ?
              this.inverseMercator(olBounds.top, olBounds.right) :
              new OpenLayers.LonLat(olBounds.top, olBounds.right);

            // @todo get the LatLng bounds from Here Map api

        }
        return moBounds;
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
        var size = this.map.getSize();
        var lon = this.getLongitudeFromMapObjectLonLat(this.mapObject.center);
        var lat = this.getLatitudeFromMapObjectLonLat(this.mapObject.center);
        var res = this.map.getResolution();

        var delta_x = moPixel.x - (size.w / 2);
        var delta_y = moPixel.y - (size.h / 2);

        var lonlat = new OpenLayers.LonLat(
            lon + delta_x * res,
            lat - delta_y * res
        );

        if (this.wrapDateLine) {
            lonlat = lonlat.wrapDateLine(this.maxExtent);
        }
        return this.getMapObjectLonLatFromLonLat(lonlat.lon, lonlat.lat);
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
        var lon = this.getLongitudeFromMapObjectLonLat(moLonLat);
        var lat = this.getLatitudeFromMapObjectLonLat(moLonLat);
        var res = this.map.getResolution();
        var extent = this.map.getExtent();
        return this.getMapObjectPixelFromXY((1/res * (lon - extent.left)),
                                            (1/res * (extent.top - lat)));
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
        if (this.animationEnabled === false && zoom != this.mapObject.zoom) {
            var mapContainer = this.getMapContainer();
            google.maps.event.addListenerOnce(
                this.mapObject,
                "idle",
                function() {
                    mapContainer.style.visibility = "";
                }
            );
            mapContainer.style.visibility = "hidden";
        }
        this.mapObject.setOptions({
            center: center,
            zoom: zoom
        });
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
        return this.mapObject.getBoundsZoomLevel(moBounds);
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
        var gLatLng;
        if(this.sphericalMercator) {
            var lonlat = this.inverseMercator(lon, lat);
            gLatLng = new google.maps.LatLng(lonlat.lat, lonlat.lon);
        } else {
            gLatLng = new google.maps.LatLng(lat, lon);
        }
        return gLatLng;
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
        return new google.maps.Point(x, y);
    }

};
