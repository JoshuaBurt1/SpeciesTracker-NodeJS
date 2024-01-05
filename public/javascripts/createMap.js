document.addEventListener("DOMContentLoaded", function () {
  var coordinatesElements = document.querySelectorAll('.coordinates');

  coordinatesElements.forEach(function (coordinatesElement) {
    var coordinatesText = coordinatesElement.textContent;
    var cleanedCoordinatesText = coordinatesText.replace(/\s/g, ''); // Remove whitespaces

    // Log the cleaned coordinates data
    console.log(cleanedCoordinatesText);

    try {
      // Parse coordinatesText as a string
      var coordinates = cleanedCoordinatesText;

      // Split the coordinates into an array of coordinate pairs
      var coordinatePairs = coordinates.split(';');

      // Find the common parent container for coordinates and the map
      var commonContainer = coordinatesElement.closest('.map-container');

      // Create a Leaflet map
      var map = L.map(commonContainer.querySelector('.map'));

      // Initialize arrays to store latitudes and longitudes
      var latitudes = [];
      var longitudes = [];

      // Iterate over each coordinate pair
      coordinatePairs.forEach(function (coordinatePair) {
        // Split the coordinate pair into latitude and longitude
        var [latitude, longitude] = coordinatePair.split(',');

        // Add a marker to the map for each coordinate pair
        L.marker([parseFloat(latitude), parseFloat(longitude)]).addTo(map);

        // Push latitudes and longitudes to the arrays
        latitudes.push(parseFloat(latitude));
        longitudes.push(parseFloat(longitude));
      });

      // Calculate the bounding box with padding (0.1 degrees in this example)
      var minLat = Math.min(...latitudes) - 0.1;
      var maxLat = Math.max(...latitudes) + 0.1;
      var minLng = Math.min(...longitudes) - 0.1;
      var maxLng = Math.max(...longitudes) + 0.1;

      // Set the map view to center and fit the bounding box
      map.fitBounds([
        [minLat, minLng],
        [maxLat, maxLng]
      ]);

      // Add a tile layer to the map
      L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        attribution: '© Google Maps'
      }).addTo(map);
    } catch (error) {
      console.error("Error parsing coordinates:", error);
    }
  });
});