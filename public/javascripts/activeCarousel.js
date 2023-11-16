//UPDATE BASED SAVING PREVIOUS VARIABLE BEFORE ROUTE CHANGE (front-end/back-end)
const carousel = document.getElementById('carouselBackground');
carousel.addEventListener('slid.bs.carousel', () => {
    const activeItem = document.querySelector('.carousel-item.active');
    const carouselId = activeItem.querySelector('img').getAttribute('id');
    console.log(carouselId);
});
var idNum = carousel.addEventListener('slid.bs.carousel', () => {
    const activeItem = document.querySelector('.carousel-item.active');
    const carouselId = activeItem.querySelector('img').getAttribute('id');
    console.log(carouselId);
});

console.log(idNum);