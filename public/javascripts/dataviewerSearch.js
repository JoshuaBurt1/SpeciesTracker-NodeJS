//the reason for this search format in dataviewer is:
//1. large amount of data, takes 10+ seconds to load everything initially, so the user needs to make a specific search
//2. easier to load more data per single species
document.addEventListener('DOMContentLoaded', () => {
  const jsonUrl = '/routes/speciesList.json'; // Ensure this path is correct
  const searchInput = document.getElementById('dataviewer-search-bar');
  const dropdownMenu = document.getElementById('dataviewer-dropdown-menu');
  const form = document.getElementById('dataviewer-dropdown-form');
  
  let cachedOptions = [];
  let isDataFetched = false;

  const showDropdown = () => {
    dropdownMenu.style.visibility = 'visible'; 
    dropdownMenu.style.opacity = '1'; 
    dropdownMenu.style.pointerEvents = 'auto'; 
  };

  const hideDropdown = () => {
    dropdownMenu.style.visibility = 'hidden'; 
    dropdownMenu.style.opacity = '0'; 
    dropdownMenu.style.pointerEvents = 'none'; 
  };

  const fetchOptions = async () => {
    try {
      const response = await fetch(jsonUrl);
      
      // Check if the response is ok
      if (!response.ok) {
        console.error('Network response was not ok:', response.statusText);
        return;
      }

      cachedOptions = await response.json();
      isDataFetched = true; // Mark data as fetched
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const populateDropdown = (query = '') => {
    if (!isDataFetched) {
      console.warn('Data not fetched yet. Aborting dropdown population.');
      return;
    }

    dropdownMenu.innerHTML = ''; 

    if (query.length === 0) {
      hideDropdown(); 
      return;
    }

    const filteredOptions = cachedOptions.filter(option => 
      option.name.toLowerCase().includes(query.toLowerCase()) ||
      option.binomialNomenclature.toLowerCase().includes(query.toLowerCase())
    );

    if (filteredOptions.length > 0) {
      filteredOptions.forEach(option => {
        const optionElement = document.createElement('a');
        optionElement.className = 'dropdown-item';
        optionElement.href = '#';
        optionElement.innerHTML = `${option.name} : <i>${option.binomialNomenclature}</i>`; // Use innerHTML to allow HTML tags
        optionElement.addEventListener('click', () => {
          searchInput.value = option.binomialNomenclature; 
          form.submit(); 
        });
        dropdownMenu.appendChild(optionElement);
      });
      showDropdown(); 
    } else {
      hideDropdown(); 
    }
  };

  // Debounce function (commented out for now)
  /*
  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };
  */

  // Check if the current path is "/dataviewer"
  if (window.location.pathname === '/dataviewer') {
    // Fetch options initially on page load
    fetchOptions().then(() => {
      searchInput.addEventListener('input', (event) => {
        populateDropdown(event.target.value);
        // If you want to use debounce, uncomment the following line:
        // debounce((value) => populateDropdown(value), 300)(event.target.value);
      });
    });
  }

  // Initial state: hide dropdown
  hideDropdown();
});
