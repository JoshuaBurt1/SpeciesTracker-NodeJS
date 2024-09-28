# SpeciesTracker
concept biological catalogue <br>
https://speciestracker3.azurewebsites.net/

# To Start: <br>
* Download zip, open in code editor
* Download node.js, create a MongoDB account and cluster
* In terminal: npm init -y
* Download dependencies: npm i connect cookie-parser csv-writer debug ejs express express-session fs http-errors leaflet mongodb mongoose morgan multer nodemon passport passport-github2 passport-local-mongoose url axios form-data cors express-fileupload os
* Add folder & file config/globals.js <br>
const configurations = {  <br>
  plantNetAPI: "your_plantNet_API_key", <br>
  openAIAPIKey: "your_openAI_API_key", <br>
  db: "your_mongodb_link",  <br>
  github: { <br>
    clientId: "your_id", <br>
    clientSecret: "your_secret", <br>
    callbackUrl: "callback_url", <br>
  }, <br>
}; <br>
module.exports = configurations;<br>
* In terminal: nodemon

# Capabilities <br>
~Database with create, read, update, delete <br>
~Search bar <br>
~Image upload <br>
~Date, time, gps autofill <br>
~Coordinates to map & map to coordinates <br>
~Single and multi plant image identification (plantNet API) <br>
~OpenAI API in dataviewer to compare and analyze multiple species location and time data <br>
~Website databaseAPI, csv download, total image download <br>
~User authentication & github auth <br>
~Message board <br>
~Admin privileges <br>
