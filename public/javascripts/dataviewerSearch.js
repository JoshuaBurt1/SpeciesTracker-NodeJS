//the reason for this search format in dataviewer is:
//1. large amount of data, takes 10+ seconds to load everything initially, so the user needs to make a specific search
//2. easier to load more data per single species
document.addEventListener('DOMContentLoaded', () => {
  const jsonUrl = '/routes/speciesList.json'; // Ensure this path is correct
  const searchInput = document.getElementById('dataviewer-search-bar');
  const dropdownMenu = document.getElementById('dataviewer-dropdown-menu');
  const form = document.getElementById('dataviewer-dropdown-form');

  const cleanValue = (value) => {
    return value.replace(/[\(\)].*$/, '').trim();
  };

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

  const populateDropdown = async (query = '') => {
    try {
      const response = await fetch(jsonUrl);
      
      // Check if the response is ok
      if (!response.ok) {
        console.error('Network response was not ok:', response.statusText);
        return;
      }

      const options = await response.json();
      if (query.length === 0) {
        dropdownMenu.innerHTML = ''; 
        hideDropdown(); 
      } else {
        const filteredOptions = options.filter(option => 
          option.name.toLowerCase().includes(query.toLowerCase()) ||
          option.binomialNomenclature.toLowerCase().includes(query.toLowerCase())
        );
        dropdownMenu.innerHTML = ''; 
        if (filteredOptions.length > 0) {
          filteredOptions.forEach(option => {
            const cleanedBinomialNomenclature = cleanValue(option.binomialNomenclature);
            const optionElement = document.createElement('a');
            optionElement.className = 'dropdown-item';
            optionElement.href = '#';
            optionElement.textContent = `${option.name} - ${cleanedBinomialNomenclature}`;
            optionElement.addEventListener('click', () => {
              searchInput.value = cleanedBinomialNomenclature; 
              form.submit(); 
            });
            dropdownMenu.appendChild(optionElement);
          });
          showDropdown(); 
        } else {
          hideDropdown(); 
        }
      }
    } catch (error) {
      console.error('Error fetching dropdown options:', error);
    }
  };
  
  searchInput.addEventListener('input', (event) => {
    populateDropdown(event.target.value);
  });

  // Initial state: hide dropdown
  hideDropdown();
});