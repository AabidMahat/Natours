const map = new maplibregl.Map({
    container: 'map',
    style: 'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
    zoom: 0,
});

map.on('load', () => {
    window.setInterval(() => {
        // Make a GET request to get two random numbers
        fetch(
            'https://www.random.org/decimal-fractions/?num=2&dec=10&col=1&format=plain&rnd=new'
        )
            .then((r) => r.text())
            .then((text) => {
                // Takes the two random numbers between 0 and 1 and converts them to degrees
                const coordinates = text
                    .split('\n')
                    .map((l) => Number(l) * 180 - 90);
                const json = {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates,
                    },
                };
                // Update the drone symbol's location on the map
                map.getSource('drone').setData(json);

                // Fly the map to the drone's current location
                map.flyTo({
                    center: json.geometry.coordinates,
                    speed: 0.5,
                });
            });
    }, 2000);

    // Set initial location at (0,0).
    map.addSource('drone', {
        type: 'geojson',
        data: {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [0, 0],
            },
        },
    });
    map.addLayer({
        id: 'drone',
        type: 'symbol',
        source: 'drone',
        layout: {
            'icon-image': 'rocket_15',
        },
    });
});
map.addControl(
    new maplibregl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true,
        },
        trackUserLocation: true,
    })
);
