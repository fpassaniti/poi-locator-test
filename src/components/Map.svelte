<svelte:head>
    <link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css"/>
    <link rel='stylesheet'
          href='https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.2.0/mapbox-gl-geocoder.css'
          type='text/css'/>

    <link rel="stylesheet" href="static/fonts/style.css"/>
</svelte:head>

<script>
    import {onMount, setContext} from 'svelte';
    import mapbox from 'mapbox-gl';

    import {geojson} from '../utils/store2'
    import {mapPosition, listPosition, bounds} from '../utils/position'
    import {media} from '../utils/mediaQueries';
    import config from '../../app.config'
    import {createDonutChart, createClusterProperties} from "../utils/mapHelpers";

    import {scaleLinear} from 'd3-scale';

    mapbox.accessToken = config.mapbox.apikey;

    let container;
    let map;

    // objects for caching and keeping track of HTML marker objects (for performance)
    var markers = {};
    var markersOnScreen = {};

    setContext('map', {
        getMap: () => map
    });

    /*    $: map && map.getSource('data') && map.getSource('data').setData($geojson); // && updateMarkers() && console.log('REACTIVE map setData (source updated) !');
        $: map && map.fitBounds($bounds, {
            padding: {
                bottom: $media.tablet ? 0 : 100,
                top: $media.tablet ? 0 : 100,
                left: $media.tablet ? 0 : 350,
                right: $media.tablet ? 0 : 80
            }
        });
        $: map && $mapPosition && map.flyTo({
            center: $mapPosition,
            zoom: 18,
            padding: {
                bottom: $media.tablet ? 0 : 0,
                left: $media.tablet ? 0 : 390
            }
        }) && updateMarkers(); // TODO : global variable for left nav*/

    var layers = [];

    onMount(async () => {
        //await geojson.updateWhereQuery(config.data.where);
        //bounds.init_or_reset($geojson);

        map = new mapbox.Map({
            container,
            style: config.mapbox.style,
            center: config.mapbox.init.center,
            zoom: config.mapbox.init.zoom
        });
        map.addControl(new mapbox.NavigationControl());
        map.on('load', () => {
            console.log(createClusterProperties());
            /* Data */
            map.addSource('data', {
                type: 'geojson',
                data: 'les-arbres.geojson',
                //data: $geojson,
                cluster: true,
                //clusterId: 'clusters',
                clusterMaxZoom: 15, // Max zoom to cluster points on
                clusterRadius: 100, // Radius of each cluster when clustering points (defaults to 50)
                clusterProperties: createClusterProperties()
            });

            // after the GeoJSON data is loaded, update markers on the screen and do so on every map move/moveend
            map.on('data', function (e) {
                if (e.sourceId !== 'data' || !e.isSourceLoaded) return;
                console.log("reload data !");

                map.on('move', updateMarkers);
                map.on('moveend', updateMarkers);
                updateMarkers();
            });

            map.addLayer({
                'id': "points",
                'type': 'circle',
                'cluster': false,
                'source': 'data',
                'layout': {},
                'paint': {
                    'circle-radius': [
                        'interpolate', ['linear'], ['zoom'],
                        8, 1,
                        15, 2,
                        19, 6,
                        22, 10
                    ],
                    'circle-opacity': 0.8,
                    'circle-color': [
                        'match',
                        ['get', 'stadedeveloppement'],
                        'A',
                        '#317256',
                        'J',
                        '#398564',
                        'JA',
                        '#419873',
                        'M',
                        '#49ab81',
                        /* other */ '#52bf90'
                    ]
                }
            });

            /*map.addLayer({
                id: 'clusters',
                type: 'circle',
                source: 'data',
                filter: ['has', 'point_count'],
                paint: {
                    'circle-color': [
                        'step',
                        ['get', 'point_count'],
                        '#51bbd6',
                        100,
                        '#f1f075',
                        750,
                        '#f28cb1'
                    ],
                    'circle-radius': [
                        'step',
                        ['get', 'point_count'],
                        20,
                        100,
                        30,
                        750,
                        40
                    ]
                }
            });

            map.addLayer({
                id: 'cluster-count',
                type: 'symbol',
                source: 'data',
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': '{point_count_abbreviated}',
                    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                    'text-size': 12
                }
            });*/

            map.on('click', function (e) {
                console.log('click in the map !!');
                console.log(map.queryRenderedFeatures(e.point));

                var items = map.queryRenderedFeatures(e.point, {
                    layers: ['points']
                });
                if (items.length == 1) {
                    listPosition.scrollTo(items[0].properties.feature_id);
                }
                if (items.length > 1) {
                    var coordinates = e.lngLat;
                    var el = document.createElement('div');
                    items.forEach((item) => {
                        var div = document.createElement('div');
                        div.classList.add('is-flex', 'is-align-items-center', 'poi');

                        var img = document.createElement('img');
                        img.src = 'static/img/' + config.pictos[item.properties[config.data.type_field]].name + '.png';
                        div.appendChild(img);

                        var label = document.createElement('p');
                        label.innerText = item.properties.name;
                        div.appendChild(label);

                        div.addEventListener('click', (e) => {
                            var event_local_feature_id = item.properties.feature_id;
                            listPosition.scrollTo(event_local_feature_id);
                        });

                        el.appendChild(div);
                    });

                    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                    }

                    new mapbox.Popup()
                            .setLngLat(items[0].geometry.coordinates)
                            .setDOMContent(el)
                            .addTo(map);
                }
            });

            map.on('mousemove', function (e) {
                var items = map.queryRenderedFeatures(e.point, {
                    layers: ['points']
                });
                if (items.length > 0) {
                    map.getCanvas().style.cursor = 'pointer';
                } else {
                    map.getCanvas().style.cursor = 'default';
                }
            });
        });


        function updateMarkers() {
            var newMarkers = {};
            var features = map.querySourceFeatures('data');
            console.log("nb features : " + features.length);
            // for every cluster on the screen, create an HTML marker for it (if we didn't yet),
            // and add it to the map if it's not there already
            var min = Infinity, max = -Infinity;
            for (var i = 0; i < features.length; i++) {
                var props = features[i].properties;
                if (!props.cluster) continue;
                var count = props.point_count;
                if (count < min) min = count;
                if (count > max) max = count;
            }
            const textScale = scaleLinear()
                    .domain([min, max])
                    .range([16, 22]);
            const radiusScale = scaleLinear()
                    .domain([min, max])
                    .range([24, 70]);
            console.log(radiusScale(20000));

            console.log("min : ",min,", max : ",max);
            for (var i = 0; i < features.length; i++) {
                var coords = features[i].geometry.coordinates;
                var props = features[i].properties;
                if (!props.cluster) continue;
                var id = props.cluster_id;
                var count = props.point_count;
                var source = map.getSource('data');
                /*source.getClusterLeaves(id, count, 0, function (error, features) {
                    console.log('# Cluster leaves:', error, features.length);
                });*/
                var marker = markers[id];
                if (!marker) {
                    var el = createDonutChart(props, textScale, radiusScale);
                    el['dataset']['cluster_id'] = id;
                    el['dataset']['cluster_count'] = count;
                    el['dataset']['cluster_lnglat'] = coords;
                    marker = markers[id] = new mapbox.Marker({
                        element: el
                    }).setLngLat(coords);
                    marker.getElement().addEventListener('click', (e) => {
                        var eldataset = e.target['dataset'];
                        var elcoords = eldataset['cluster_lnglat'].split(',');
                        map.easeTo({
                            center: {lon: elcoords[0], lat: elcoords[1]},
                            zoom: map.getZoom() + 2
                        })
                    });
                }
                newMarkers[id] = marker;
                if (!markersOnScreen[id]) marker.addTo(map);
            }
            // for every marker we've added previously, remove those that are no longer visible
            for (id in markersOnScreen) {
                if (!newMarkers[id]) markersOnScreen[id].remove();
            }
            markersOnScreen = newMarkers;
        }


    });

</script>

<div id="this-is-not-a-map" bind:this={container}>
    {#if map}
        <slot></slot>
    {/if}
</div>

<style lang="scss" global>
    @import "../style/bulma-custom";

    #this-is-not-a-map {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        height: 100vh;
        width: 100vw;
    }

    .mapboxgl-canvas {
        &:focus {
            outline: none;
        }
    }

    .mapboxgl-ctrl-top-right {
        display: flex;
        align-items: center;
    }

    .mapboxgl-marker > * { // keep click event no marker and not the svg inside
        pointer-events: none;
    }

    .mapboxgl-popup {
        .poi {
            * {
                pointer-events: none; // let pointer click events on .poi and not the rest
            }

            img {
                height: 26px;
                width: 26px;
            }

            padding: $spacing-100/2 $spacing-100;

            p {
                margin-left: $spacing-100 / 2;
                font-weight: 500;
                font-size: $size-4;
            }

            &:hover {
                background-color: $light-300;
                cursor: pointer;
            }
        }
    }

    .mapboxgl-popup-content {
        padding: 0 !important;
    }
</style>