var map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    attribution: '© Google Maps'
}).addTo(map);

var marker;

// Function to set marker and update coordinates based on input value
function setMarkerAndCoordinates(lat, lon) {
    if (!marker) {
        marker = L.marker([lat, lon]).addTo(map);
    } else {
        marker.setLatLng([lat, lon]);
    }

    map.setView([lat, lon], 13);
    document.getElementById('coordinates').innerHTML = 'Coordinates: ' + lat + ', ' + lon;
}

var input = document.getElementById('location');
input.addEventListener('input', function () {
    var inputValue = this.value.trim();

    // Check if input value is in the format "lat, lon"
    var coordinatesRegex = /^([-+]?\d*\.\d+),\s*([-+]?\d*\.\d+)$/;

    if (coordinatesRegex.test(inputValue)) {
        var match = coordinatesRegex.exec(inputValue);
        var lat = parseFloat(match[1]);
        var lon = parseFloat(match[2]);

        setMarkerAndCoordinates(lat, lon);
    } else {
        // Use geocoding service if input is not in coordinates format
        fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + inputValue)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    var lat = parseFloat(data[0].lat);
                    var lon = parseFloat(data[0].lon);

                    setMarkerAndCoordinates(lat, lon);
                }
            })
            .catch(error => console.error('Error:', error));
    }
});

// Event listener for when the map is clicked
map.on('click', function (e) {
    var lat = e.latlng.lat;
    var lon = e.latlng.lng;

    setMarkerAndCoordinates(lat, lon);
});

// Trigger the input event to check for existing coordinates on page load
input.dispatchEvent(new Event('input'));