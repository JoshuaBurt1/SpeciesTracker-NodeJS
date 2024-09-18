var express = require('express');
const fs = require('fs'); //for image download
const archiver = require('archiver'); //for image download
const path = require('path');
var router = express.Router();
var User = require("../models/user");
var passport = require("passport");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
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
      // Use binomialNomenclature as the key, and the whole item as the value
      if (!uniqueDataMap.has(binomialNomenclature)) {
        uniqueDataMap.set(binomialNomenclature, { name, binomialNomenclature });
      }
    });
    // Convert map values to an array for the JSON file
    const speciesList = Array.from(uniqueDataMap.values());
    const filePath = path.join(__dirname, 'speciesList.json');
    fs.writeFileSync(filePath, JSON.stringify(speciesList, null, 2), 'utf-8');

    console.log('Created: speciesList.json');
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

// GET handler for /login
router.get("/login", logMiddleware, (req, res, next) => {
  let messages = req.session.messages || [];
  req.session.messages = [];
  res.render("login", {user: req.user, title: "Login to the App", messages: messages });
});

//POST /login (user click login button)
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureMessage: "Invalid Credentials",
  })
);

// GET handler for /register (user loads page)
router.get("/register", logMiddleware, (req, res, next) => {
  res.render("register", {user: req.user, title: "Create an Account" });
});

  //POST handler for /register
router.post("/register", (req, res, next) => {
  // Create a new user based on the information from the page
  User.register(
    new User({
      username: req.body.username,
      email: req.body.email,
    }),
    req.body.password,
    (err, newUser) => {
      if (err) {
        console.log(err);
        // take user back and reload register page
        return res.redirect("/register");
      } else {
        // log user in
        req.login(newUser, (err) => {
          res.redirect("/");
        });
      }
    }
  );
});


// GET handler for logout
router.get("/logout", logMiddleware, (req, res, next) => {
  req.logout(function (err) {
    res.redirect("/login");
  });
});

// GET handler /github passport authenticate and pass the name of the strategy 
router.get('/github', passport.authenticate('github', { scope: ['user.email'] }));

// GET handler for /github/callback 
// this is the url they come back to after entering their credentials
router.get('/github/callback',
  // callback to send user back to login if unsuccessful
  passport.authenticate('github', { failureRedirect: '/login' }),
  // callback when login is successful
  (req, res, next) => { res.redirect('/') }
);

/* GET handlers */
//homepage
router.get('/', logMiddleware, function(req, res, next) {
  res.render('index', { user: req.user, title: 'Species Tracker'});
});

router.get("/dataViewer", logMiddleware, async (req, res, next) => {
  writeSpeciesListToFile();
  try {
    let searchQuery = req.query.searchBar || '';
    let kingdomQuery = req.query.searchBar || '';
    let binomialNomenclatureQuery = req.query.searchBar || '';

    // Prevents long load time of returning all data
    if (!searchQuery.trim()) {  // If no search query is provided, render the page with a message or empty data
      return res.render("dataViewer", {
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
    res.render("dataViewer", {
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

// Group and sort data API endpoint
router.get("/api", async (req, res) => {
  try {
    let searchQuery = req.query.searchBar || "";
    let kingdomQuery = req.query.searchBar || "";

    // Create a function to fetch data from a specific model
    const fetchData = async (model) => {
      return await model.find({
        $or: [
          { name: { $regex: new RegExp(searchQuery, 'i') } },
          { kingdom: { $regex: new RegExp(kingdomQuery, 'i') } },
        ],
      }).sort({ binomialNomenclature: 1 });
    };

    // Fetch data from each model without pagination
    const [plantData, fungusData, animalData, protistData, bacteriumData] = await Promise.all([
      fetchData(Plant),
      fetchData(Fungus),
      fetchData(Animal),
      fetchData(Protist),
      fetchData(Bacterium)
      // Add queries for other models (Plant, Bacterium) if needed
    ]);

    // Combine data from different models into a single array
    const combinedData = [...plantData, ...fungusData, ...animalData, ...protistData, ...bacteriumData];

    // Group entries by name and collect locations, update dates into arrays
    const groupedData = combinedData.reduce((acc, item) => {
      const existingItem = acc.find((groupedItem) => groupedItem.name === item.name);

      if (existingItem) {
        existingItem.locations.push(item.location);
        existingItem.updateDates.push(item.updateDate);
        // Exclude pushing item.image into the images array
      } else {
        acc.push({
          binomialNomenclature: item.binomialNomenclature,
          name: item.name,
          kingdom: item.kingdom,
          locations: [item.location],
          updateDates: [item.updateDate],
          // Exclude creating images array and pushing item.image
        });
      }

      return acc;
    }, []);

    // Sort each named entry by updateDate keeping association to location
    groupedData.forEach((group) => {
      const zippedData = group.updateDates.map((updateDate, index) => ({
        updateDate,
        location: group.locations[index],
        // Exclude including image in zippedData
      }));
      zippedData.sort((a, b) => a.updateDate.localeCompare(b.updateDate));
      group.locations = zippedData.map((item) => item.location);
      group.updateDates = zippedData.map((item) => item.updateDate);
      // Exclude creating and mapping the images array
    });

    // Respond with the groupedData in JSON format
    res.json(groupedData);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Download data as CSV endpoint
router.get("/download-csv", async (req, res) => {
  try {
      // Define the binomialNomenclatureQuery and kingdomQuery directly, or retrieve from req if needed
      const binomialNomenclatureQuery = req.body.binomialNomenclatureQuery || ""; // Adjust as necessary
      const kingdomQuery = req.body.kingdomQuery || ""; // Adjust as necessary

      // Fetch data from each model
      const modelData = await Promise.all(MODEL_NAMES.map(model => 
          fetchData(modelMap[model], binomialNomenclatureQuery, kingdomQuery)
      ));

      // Combine data from different models into a single array
      const combinedData = modelData.flat();

      // Group entries by name and collect locations and update dates into arrays
      const groupedData = combinedData.reduce((acc, item) => {
          const existingItem = acc.find(groupedItem => groupedItem.name === item.name);
          if (existingItem) {
              existingItem.locations.push(item.location);
              existingItem.updateDates.push(item.updateDate);
          } else {
              acc.push({
                  binomialNomenclature: item.binomialNomenclature,
                  name: item.name,
                  kingdom: item.kingdom,
                  locations: [item.location],
                  updateDates: [item.updateDate],
              });
          }
          return acc;
      }, []);

      // Prepare data for CSV output
      const csvData = groupedData.map(group => ({
          binomialNomenclature: group.binomialNomenclature,
          name: group.name,
          kingdom: group.kingdom,
          locations: group.locations.join(', '), // Join locations as a string
          updateDates: group.updateDates.join(', '), // Join update dates as a string
      }));

      // Create a CSV writer
      const csvPath = path.join(__dirname, "speciesData.csv");
      const csvWriter = createCsvWriter({
          path: csvPath,
          header: [
              { id: "binomialNomenclature", title: "Binomial Nomenclature" },
              { id: "name", title: "Name" },
              { id: "kingdom", title: "Kingdom" },
              { id: "locations", title: "Locations" },
              { id: "updateDates", title: "Update Dates" },
          ],
      });

      // Write the CSV data to the file
      await csvWriter.writeRecords(csvData);

      // Send the CSV file as a response
      res.attachment("speciesData.csv").sendFile(csvPath);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

/* //single folder download (animals)
router.get('/download-images', (req, res) => {
    const directoryPath = path.join(__dirname, '../public/images/animalia_images');
    // Create a new zip archive
    const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level
    });
    // Set the response headers for streaming
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="speciesImages.zip"');
    res.setHeader('Transfer-Encoding', 'chunked'); // Enable chunked transfer encoding
    // Pipe the archive to the response object
    archive.pipe(res);
    // Add files to the archive
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return res.status(500).send('Error reading directory');
        }
        // Check if there are any files in the directory
        if (files.length === 0) {
            console.error('No files found in directory:', directoryPath);
            return res.status(404).send('No images found');
        }
        files.forEach(file => {
            const filePath = path.join(directoryPath, file);
            archive.file(filePath, { name: file });
        });
        // Finalize the archive
        archive.finalize();
    });
    // Handle archive errors
    archive.on('error', err => {
        console.error('Error creating archive:', err);
        res.status(500).send('Error creating archive');
    });
});
*/

router.get('/download-images', (req, res) => {
  const directoryPath = path.join(__dirname, '../public/images');
  // Create a new zip archive
  const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level
  });
  // Pipe the archive to the response object
  archive.pipe(res);
  // Function to recursively add files from all directories
  function addFilesToArchive(dir) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
          const filePath = path.join(dir, file);
          if (fs.statSync(filePath).isDirectory()) {
              addFilesToArchive(filePath);
          } else {
              archive.file(filePath, { name: path.relative(directoryPath, filePath) });
          }
      });
  }
  // Add files from all directories
  addFilesToArchive(directoryPath);
  // Finalize the archive
  archive.finalize();
  // Handle archive errors
  archive.on('error', err => {
      console.error('Error creating archive:', err);
      res.status(500).send('Error creating archive');
  });
  // Set the response headers
  res.attachment('images.zip');
});

//Calculates image data size from server and returns to client side
router.get('/images-info', (req, res) => {
  const imagesDirectory = path.join(__dirname, '../public/images');
  // Function to recursively calculate directory size
  function getDirectorySize(directory) {
    //console.log('Calculating size for directory:', directory);
    let totalSize = 0;
    const files = fs.readdirSync(directory);
    //console.log('Files in directory:', files);
    files.forEach(file => {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            //console.log('Entering subdirectory:', filePath);
            totalSize += getDirectorySize(filePath);
        } else {
            //console.log('File:', filePath, 'Size:', stats.size);
            totalSize += stats.size;
        }
    });
    //console.log('Total size for directory:', directory, 'is', totalSize);
    return totalSize;
}
  // Calculate the size of the images directory
  const directorySize = getDirectorySize(imagesDirectory);
  // Convert bytes to kilobytes for easier readability
  const sizeGB = Math.round(directorySize);
  // Send the response with the directory size in KB
  res.json({ size: sizeGB });
});

module.exports = router;