mapboxgl.accessToken = mapBoxToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/light-v10', // style URL
    center: place.geometry.coordinates, // starting position [lng, lat]
    zoom: 11 // starting zoom
});

new mapboxgl.Marker()
    .setLngLat(place.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
        .setHTML(
            `<h5>${place.title}</h5><p>${place.address}</p>`
        )
    )
    .addTo(map)
;

map.addControl(new mapboxgl.NavigationControl());