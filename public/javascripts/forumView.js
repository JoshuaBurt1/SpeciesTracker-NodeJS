document.addEventListener("DOMContentLoaded", function () {
    // Get all elements with the class 'truncated'
    var truncatedElements = document.querySelectorAll('.truncated');
  
    // Function to truncate text
    function truncateWords(text, limit) {
      const words = text.split(' ');
      if (words.length > limit) {
        return words.slice(0, limit).join(' ') + '...';
      }
      return text;
    }
  
    // Iterate through each 'truncated' element
    truncatedElements.forEach(function (truncateElement) {
      // Apply the truncateWords function to the inner HTML of each element
      truncateElement.innerHTML = truncateWords(truncateElement.innerHTML, 10);
    });
  });