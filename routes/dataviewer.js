//NOTE: use the dataviewer folder to add the buttons to compare data and make inferences
var express = require('express');
const fs = require('fs'); //for image download
const path = require('path');
var router = express.Router();
var logMiddleware = require('../logMiddleware'); //route logging middleware

// Constants
const MODEL_NAMES = ['Plant','Fungus','Animal','Protist','Bacterium'];
const pageSize = 4;

// Import Mongoose models
const Plant = require("../models/plant");
const Fungus = require("../models/fungus");
const Animal = require("../models/animal");
const Protist = require("../models/protist");
const Bacterium = require("../models/bacterium");

// Map model names to model references
const modelMap = {
  'Plant': Plant,
  'Fungus': Fungus,
  'Animal': Animal,
  'Protist': Protist,
  'Bacterium': Bacterium
};

//Creates a json file of all names and binomialNomenclature when a user goes to /dataViewer => Necessary for faster drop-down menu searching
//A decision was made regarding drop-down menu option generation; Option 1 was chosen
//1. Read from a .json file generated once and populate options (Fast)
//2. make an fetch request from client side each time the user types in a letter, the drop-drop menu is then updated: (Approx 3sec downdown menu change per letter entered)
/* 
CLIENT-SIDE (searchBar.js)
document.addEventListener('DOMContentLoaded', () => {
  const apiUrl = '/api/dropdown-options';
  const searchInput = document.getElementById('search-bar');
  const dropdownMenu = document.getElementById('dropdown-menu');
  const form = document.getElementById('dropdown-form');

  const populateDropdown = async (query = '') => {
    try {
      const response = await fetch(apiUrl);
      const options = await response.json(); //this is taking a long time
      if (query.length === 0) {
        dropdownMenu.innerHTML = ''; // Clear dropdown if no input
      } else {
        const filteredOptions = options.filter(option => 
          option.name.toLowerCase().includes(query.toLowerCase()) ||
          option.binomialNomenclature.toLowerCase().includes(query.toLowerCase())
        );
        dropdownMenu.innerHTML = '';
        filteredOptions.forEach(option => {
          const optionElement = document.createElement('a');
          optionElement.className = 'dropdown-item';
          optionElement.href = '#';
          optionElement.textContent = `${option.name} - ${option.binomialNomenclature}`;
          optionElement.addEventListener('click', () => {
            searchInput.value = option.name; // Set the input value to the selected option
            form.submit(); // Submit the form with the selected option
          });
          dropdownMenu.appendChild(optionElement);
        });
      }
    } catch (error) {
      console.error('Error fetching dropdown options:', error);
    }
  };

  searchInput.addEventListener('input', (event) => {
    populateDropdown(event.target.value);
  });

  // Clear dropdown initially
  dropdownMenu.innerHTML = '';
});

//SERVER-SIDE
router.get('/api/dropdown-options', async (req, res) => {
  try {
    // Fetch data from each model
    const modelData = await Promise.all(MODEL_NAMES.map(modelName =>
      fetchData(modelMap[modelName])
    ));
    // Combine data from different models into a single array
    const combinedData = modelData.flat();
    console.log(combinedData);
    // Create a map to ensure unique binomial nomenclature and associated names
    const uniqueDataMap = new Map();
    combinedData.forEach(item => {
      const { name, binomialNomenclature } = item;
      // Check if the binomial nomenclature is already in the map
      if (!uniqueDataMap.has(binomialNomenclature)) {
        uniqueDataMap.set(binomialNomenclature, { name, binomialNomenclature });
      }
    });
    const dropdownOptions = Array.from(uniqueDataMap.values());
    res.json(dropdownOptions);
  } catch (error) {
    console.error('Error fetching dropdown options:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
*/

const writeSpeciesListToFile = async () => {
    try {
      const modelData = await Promise.all(MODEL_NAMES.map(modelName =>
        fetchData(modelMap[modelName])
      ));
      const combinedData = modelData.flat();
  
      // Create a map to ensure unique binomial nomenclature
      const uniqueDataMap = new Map();
      combinedData.forEach(item => {
        const { name, binomialNomenclature } = item;
        if (!uniqueDataMap.has(binomialNomenclature)) {
          uniqueDataMap.set(binomialNomenclature, { name, binomialNomenclature });
        }
      });
  
      // Convert map values to an array for the JSON file
      const speciesList = Array.from(uniqueDataMap.values());
      const filePath = path.join(__dirname, 'speciesList.json');
  
      // Check if the file exists and read its content
      //NOTE: creating a json file causes nodemon to restart, this logs the user out 
      //comparing the data is necessary to prevent the above issue
      let existingData = [];
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        existingData = JSON.parse(fileContent);
      }
  
      // Compare new data with existing data
      if (JSON.stringify(existingData) !== JSON.stringify(speciesList)) {
        // Write to file only if data has changed
        fs.writeFileSync(filePath, JSON.stringify(speciesList, null, 2), 'utf-8');
        console.log('Updated: speciesList.json');
      } else {
        console.log('No changes detected, speciesList.json not updated.');
      }
    } catch (error) {
      console.error('Error writing: speciesList.json', error);
    }
  };

// Helper function to fetch data from a specific model
const fetchData = async (model, searchQuery, binomialNomenclatureQuery, kingdomQuery) => {
  return await model.find({
    $or: [
      { name: { $regex: new RegExp(searchQuery, 'i') } },
      { binomialNomenclature: { $regex: new RegExp(binomialNomenclatureQuery, 'i') } },
      { kingdom: { $regex: new RegExp(kingdomQuery, 'i') } },
    ],
  }).sort({ binomialNomenclature: 1 });
};


router.get("/", logMiddleware, async (req, res, next) => {
    writeSpeciesListToFile();
    try {
      let searchQuery = req.query.searchBar || '';
      let kingdomQuery = req.query.searchBar || '';
      let binomialNomenclatureQuery = req.query.searchBar || '';
  
      // Prevents long load time of returning all data
      if (!searchQuery.trim()) {  // If no search query is provided, render the page with a message or empty data
        return res.render("dataviewer/index", {
          title: "Data Viewer",
          user: req.user,
          dataset: [], // Empty dataset since there's no search query
          searchQuery: searchQuery,
          totalPages: 0,
          currentPage: 1,
        });
      }
      
      // Fetch data from each model (plants, fungus, animal, protist, bacteria) to find a match to searchQuery
      const modelData = await Promise.all(MODEL_NAMES.map(model => fetchData(eval(model), searchQuery, binomialNomenclatureQuery, kingdomQuery)));
      // Combine data from different models into a single array
      const combinedData = modelData.flat();
  
      // Group entries by name and collect locations, update dates, and images into arrays
      const groupedData = combinedData.reduce((acc, item) => {
        const existingItem = acc.find((groupedItem) => groupedItem.name === item.name);
      
        if (existingItem) {
          existingItem.locations.push(item.location);
          existingItem.updateDates.push(item.updateDate);
          existingItem.images.push(item.image);
        } else {
          acc.push({
            name: item.name,
            binomialNomenclature: item.binomialNomenclature,
            kingdom: item.kingdom,
            locations: [item.location],
            updateDates: [item.updateDate],
            images: [item.image]
          });
        }
        return acc;
      }, []);
      
      // Sort each named entry by updateDate keeping association to location & image
      groupedData.forEach((group) => {
        const zippedData = group.updateDates.map((updateDate, index) => ({
          updateDate,
          location: group.locations[index],
          image: group.images[index]
        }));
        zippedData.sort((a, b) => a.updateDate.localeCompare(b.updateDate));
        group.locations = zippedData.map((item) => item.location);
        group.updateDates = zippedData.map((item) => item.updateDate);
        group.images = zippedData.map((item) => item.image);
      });
  
      //API source
      console.log(groupedData);
  
      const totalRecords = groupedData.length;
      const totalPages = Math.ceil(totalRecords / pageSize);
  
      // Paginate the grouped data
      const page = parseInt(req.query.page) || 1;
      const skipSize = pageSize * (page - 1);
      const paginatedData = groupedData.slice(skipSize, skipSize + pageSize);
  
      // Render the dataViewer page with the paginated data
      res.render("dataviewer/index", {
        title: "Data Viewer",
        user: req.user,
        dataset: paginatedData,
        searchQuery: searchQuery,
        totalPages: totalPages,
        currentPage: page,
      });
      
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  });
  module.exports = router;