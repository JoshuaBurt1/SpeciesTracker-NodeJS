//NOTE: use the dataviewer folder to add the buttons to compare data and make inferences
var express = require('express');
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

// Helper function to fetch data from a specific model
const fetchData = async (model, searchQuery, binomialNomenclatureQuery) => {
  return await model.find({
    $or: [
      { name: { $regex: new RegExp(searchQuery, 'i') } },
      { binomialNomenclature: { $regex: new RegExp(binomialNomenclatureQuery, 'i') } },
    ],
  }).sort({ binomialNomenclature: 1 });
};

router.get("/", logMiddleware, async (req, res, next) => {
  try {
    let searchQuery = req.query.searchBar || '';
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
    const modelData = await Promise.all(MODEL_NAMES.map(model => fetchData(eval(model), searchQuery, binomialNomenclatureQuery)));
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

    console.log(groupedData);
    
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

//GET handler for /plants/add (loads page)
router.get("/view", logMiddleware, async (req, res, next) => {
  try {
    const speciesName = req.query.name; // Get the name from the query parameter

    if (!speciesName) {
      return res.status(400).send("No species name provided.");
    }

    // Fetch data from each model based on the species name
    const modelData = await Promise.all(MODEL_NAMES.map(model => fetchData(eval(model), speciesName, speciesName)));
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

    // Render the details page with the species data
    res.render("dataviewer/view", {
      user: req.user,
      title: "Species Details",
      speciesData: groupedData // Pass the fetched data to the view
    });
    
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});  

module.exports = router;