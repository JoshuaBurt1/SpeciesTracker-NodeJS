document.addEventListener("DOMContentLoaded", function () {
  var coordinatesElements = document.querySelectorAll('.coordinates');

  coordinatesElements.forEach(function (coordinatesElement) {
    // Parse the data-species attribute as JSON [A. READ FROM .coordinates class json data (dataViewer)]
    try {
      var locations = JSON.parse(coordinatesElement.dataset.species);
      console.log(locations);

      // Find the common parent container for coordinates and the map
      var commonContainer = coordinatesElement.closest('tr');
      // Create a Leaflet map
      var map = L.map(commonContainer.querySelector('.map')).setView([0, 0], 2);

      // Initialize arrays to store latitudes and longitudes
      var latitudes = [];
      var longitudes = [];

      // Iterate over each location
      locations.forEach(function (location) {
        // Check if the location is an array with a length of 1
        if (Array.isArray(location) && location.length === 1) {
          // Extract the coordinates from the array
          var [coordinates] = location;
        } else {
          // Assume the location is a string in the format 'latitude, longitude'
          var coordinates = location;
        }

        // Split the coordinates into latitude and longitude
        var [latitude, longitude] = coordinates.split(',');

        // Add a marker to the map for each location
        L.marker([parseFloat(latitude), parseFloat(longitude)]).addTo(map);

        // Push latitudes and longitudes to the arrays
        latitudes.push(parseFloat(latitude));
        longitudes.push(parseFloat(longitude));
      });

      // Calculate the bounding box with padding (0.1 degrees in this example)
      var minLat = Math.min(...latitudes) - 0.2;
      var maxLat = Math.max(...latitudes) + 0.2;
      var minLng = Math.min(...longitudes) - 0.2;
      var maxLng = Math.max(...longitudes) + 0.2;

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

      // If parsing fails, fall back to the original code for single coordinates [B. READ FROM text.content (user upload views)]
      console.error("Error parsing coordinates:", error);

      var coordinates = coordinatesElement.textContent;
      var coordinatesMatch = coordinates.match(/^\s*(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)\s*$/);

      if (coordinatesMatch) {
        var [latitude, longitude] = coordinates.split(',');

        // Find the common parent container for coordinates and the map
        var commonContainer = coordinatesElement.closest('tr');

        // Create a Leaflet map
        var map = L.map(commonContainer.querySelector('.map')).setView([parseFloat(latitude), parseFloat(longitude)], 13);

        // Add a marker to the map
        L.marker([parseFloat(latitude), parseFloat(longitude)]).addTo(map);

        // Add a tile layer to the map
        L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
          attribution: '© Google Maps'
        }).addTo(map);
      } else {
        console.log("Invalid coordinates format:", coordinates);
      }
    }
  });
});