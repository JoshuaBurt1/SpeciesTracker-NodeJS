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

// Import Mongoose models
const Plant = require("../models/plant");
const Fungus = require("../models/fungus");
const Animal = require("../models/animal");
const Protist = require("../models/protist");
const Bacterium = require("../models/bacterium");


router.get("/dataViewer", logMiddleware, async (req, res, next) => {
  try {
    let searchQuery = req.query.searchBar || '';
    let kingdomQuery = req.query.searchBar || '';
    let binomialNomenclatureQuery = req.query.searchBar || '';

    // Fetch data from each model without pagination
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
      binomialNomenclatureQuery: binomialNomenclatureQuery,
      kingdomQuery: kingdomQuery,
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
router.get("/api/download-csv", async (req, res) => {
    // ... (your existing code to fetch and process data)
    try {
      let searchQuery = req.query.searchBar || "";
      let kingdomQuery = req.query.searchBar || "";
  
      // Fetch data from each model without pagination
    const modelData = await Promise.all(MODEL_NAMES.map(model => fetchData(eval(model), searchQuery, kingdomQuery)));

    // Combine data from different models into a single array
    const combinedData = modelData.flat();
  
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
  // Create a CSV writer
  const csvWriter = createCsvWriter({
  path: path.join(__dirname, "speciesData.csv"), // Use an absolute path
  header: [
    { id: "binomialNomenclature", title: "BinomialNomenclature" },
    { id: "name", title: "Name" },
    { id: "kingdom", title: "Kingdom" },
    { id: "locations", title: "Locations" },
    { id: "updateDates", title: "Update Dates" },
    // Exclude "images" from the CSV output
  ],
  });
    // Write the groupedData to the CSV file
    await csvWriter.writeRecords(groupedData);
    // Send the CSV file as a response
    res.attachment("speciesData.csv");
    res.sendFile(path.join(__dirname, "speciesData.csv")); // Use an absolute path
  } catch (err) {
    console.log(err);
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