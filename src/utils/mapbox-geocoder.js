import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
// import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

const getNewGeocoder = (mapboxInstance) => {
  geocoder = new MapboxGeocoder({
      accessToken: mapboxInstance.accessToken, // Set the access token
      mapbox: mapboxInstance, // Set the mapbox-gl instance
      marker: true, // Use the geocoder's default marker style
      bbox: [-77.210763, 38.803367, -76.853675, 39.052643] // Set the bounding box coordinates
  })
}

export { getNewGeocoder }
