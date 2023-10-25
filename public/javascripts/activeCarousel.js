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


//Server-Side Storage (Back-end):
//If you are working with a server-side framework like Express.js, you can store variables on the server, 
//typically in a session or a database, to maintain state across routes. 
//This would require server-side code to manage and retrieve the variables.

//For example, in Express.js, you might use sessions to store user-specific data across routes:

// Storing a variable in a session
//req.session.myVariable = 'myValue';

// Accessing the variable in another route
//const myValue = req.session.myVariable;
