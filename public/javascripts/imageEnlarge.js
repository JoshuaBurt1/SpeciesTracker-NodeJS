// Add a variable to keep track of the current image index for the current item
let currentImageIndex = 0;

// Function to update the image source and show the enlarged image
function showImage(element) {
  const enlargedImage = document.getElementsByClassName("enlarged-image")[0]; // Select the first element with the class "enlarged-image"
  enlargedImage.src = element.src;
  document.querySelector('.overlay').style.display = 'flex'; // Use 'flex' for proper centering
}

function hideImage() {
  document.querySelector('.overlay').style.display = 'none';
}