document.addEventListener("DOMContentLoaded", function () {
  var coordinatesElements = document.querySelectorAll('.coordinates');
  
  coordinatesElements.forEach(function (coordinatesElement) {
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
  });
  });