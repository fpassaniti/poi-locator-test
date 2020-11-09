<svelte:head>

</svelte:head>

<style lang="scss" global>
    // @import '~mapbox-gl/dist/mapbox-gl.css';

    #this-is-not-a-map {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        height: 100vh;
        width: 100vw;
    }
</style>


<script>
    import {onMount, setContext} from 'svelte';
    import mapbox from 'mapbox-gl/dist/mapbox-gl.js';
    // import { getNewGeocoder } from '../utils/mapbox-geocoder.js'

    mapbox.accessToken = 'pk.eyJ1IjoiZnBhc3Nhbml0aSIsImEiOiIxNTg3MGRlZWQyNjVkZjExMGVlNWVjNDFjOWQyNzNiMiJ9.pYKDlO4v-SNiDz08G9ZZoQ';

    let map;
    let container;
    let bounds = new mapbox.LngLatBounds();

    setContext('mapbox', {
        mapbox: mapbox,
        getMap: () => map,
        bounds: bounds
    });

    onMount(() => {
        map = new mapbox.Map({
            container,
            style: 'mapbox://styles/mapbox/outdoors-v11',
            center: [45.406164, 5.765444]
        });
        map.addControl(new mapbox.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true
        }));

        const geocoder = new MapboxGeocoder({
              accessToken: mapbox.accessToken, // Set the access token
              mapbox: mapbox, // Set the mapbox-gl instance
              marker: true, // Use the geocoder's default marker style
              bbox: [-77.210763, 38.803367, -76.853675, 39.052643] // Set the bounding box coordinates
          })

        map.addControl(geocoder, 'top-right');
    });
</script>

<div id="this-is-not-a-map" bind:this={container}>
    {#if map}
        <slot></slot>
    {/if}
</div>
