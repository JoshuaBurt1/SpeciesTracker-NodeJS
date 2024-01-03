function showImage(element) {
var enlargedImage = document.getElementById('enlarged-image');
enlargedImage.src = element.src;
document.querySelector('.overlay').style.display = 'flex'; // Use 'flex' for proper centering
}

function hideImage() {
document.querySelector('.overlay').style.display = 'none';
}