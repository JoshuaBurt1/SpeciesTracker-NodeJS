//UPDATE BASED ON ROUTE CHANGE VALUE (front-end only)
// since the browser reloads after each route change, changing class using on-click function will not keep active tab (resets on browser reload)
// fix: if the url/route = current link id -> class nav-link active
const currentRoute = window.location.pathname;

// Define a function to update the class based on the route
function updateNavLinkClass(route) {
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    link.classList.remove('active');
  });

  if (route === '/') {
    document.getElementById('homeTab').classList.add('active');
  } else if (route === '/plants') {
    document.getElementById('plantsTab').classList.add('active');
  } else if (route === '/fungi') {
    document.getElementById('fungiTab').classList.add('active');
  } else if (route === '/protists') {
    document.getElementById('protistsTab').classList.add('active');
  } else if (route === '/animals') {
    document.getElementById('animalsTab').classList.add('active');
  }
}
// Call the function to update the class based on the current route
updateNavLinkClass(currentRoute);