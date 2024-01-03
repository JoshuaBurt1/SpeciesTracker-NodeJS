document.addEventListener('DOMContentLoaded', function () {
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-bar');
  const containerResults = document.querySelector('.container-results');

  if (!searchForm || !searchInput || !containerResults) {
    console.error("Required elements not found.");
    return;
  }

  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const searchValue = searchInput.value;

    // Perform AJAX request with the search query
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/animals?searchBar=${searchValue}`, true);

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 400) {
        // Check if containerResults is not null before updating innerHTML
        if (containerResults !== null) {
          containerResults.innerHTML = xhr.responseText;
        } else {
          console.error('.container-results element not found.');
        }
      } else {
        console.error('Error:', xhr.status, xhr.statusText);
      }
    };

    xhr.onerror = function () {
      console.error('Request failed');
    };

    xhr.send();
  });
});