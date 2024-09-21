const express = require('express');
const router = express.Router();
const logMiddleware = require('../logMiddleware'); // route logging middleware

// Constants
const MODEL_NAMES = ['Plant', 'Fungus', 'Animal', 'Protist', 'Bacterium'];
const pageSize = 4;

// Import Mongoose models
const Plant = require("../models/plant");
const Fungus = require("../models/fungus");
const Animal = require("../models/animal");
const Protist = require("../models/protist");
const Bacterium = require("../models/bacterium");

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
  try {
    let searchQuery = req.query.searchBar || '';
    let kingdomQuery = req.query.searchBar || '';
    let binomialNomenclatureQuery = req.query.searchBar || '';

    // Check if search query is empty
    if (!searchQuery.trim()) {
      return res.render("dataviewer/index", {
        title: "Data Viewer",
        user: req.user,
        dataset: [],
        searchQuery: searchQuery,
        totalPages: 0,
        currentPage: 1,
      });
    }

    // Initialize or retrieve the cached data for this search //decreases pagination GET request times
    if (!req.session.modelData) {
      req.session.modelData = {};
    }

    if (!req.session.modelData[searchQuery]) {
      // Fetch data if it hasn't been fetched yet
      const modelData = await Promise.all(MODEL_NAMES.map(model => fetchData(eval(model), searchQuery, binomialNomenclatureQuery, kingdomQuery)));
      const combinedData = modelData.flat();

      // Grouping logic
      const groupedData = combinedData.reduce((acc, item) => {
        const existingItem = acc.find(groupedItem => groupedItem.name === item.name);
        
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

      // Sort grouped data by updateDate
      groupedData.forEach(group => {
        const zippedData = group.updateDates.map((updateDate, index) => ({
          updateDate,
          location: group.locations[index],
          image: group.images[index]
        }));
        zippedData.sort((a, b) => a.updateDate.localeCompare(b.updateDate));
        group.locations = zippedData.map(item => item.location);
        group.updateDates = zippedData.map(item => item.updateDate);
        group.images = zippedData.map(item => item.image);
      });

      req.session.modelData[searchQuery] = groupedData; // Cache the result
    }

    const groupedData = req.session.modelData[searchQuery];
    const totalRecords = groupedData.length;
    const totalPages = Math.ceil(totalRecords / pageSize);

    // Pagination logic
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

module.exports = router;
