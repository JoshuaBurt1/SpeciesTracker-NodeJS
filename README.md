# SpeciesTracker
concept biological catalogue <br>
https://speciestracker3.azurewebsites.net/

# To Start: <br>
* Download zip, open in code editor
* Add config folder -> globals.js file
const configurations = {  <br>
  db: "your_mongodb_link",  <br>
  github: { <br>
    clientId: "your_id", <br>
    clientSecret: "your_secret", <br>
    callbackUrl: "callback_url", <br>
  }, <br>
}; <br>
* In terminal: nodemon

# Capabilities <br>
~CRUD, Multiple tables <br>
~Search bar (by name & kingdom only) <br>
~Image upload: npm i multer <br>
~Date, time, gps autofill: npm/exif-js <br>
~Coordinates to map & map to coordinates: npm i leaflet <br>
~User authentication & github auth: npm i passport express-session passport-local-mongoose passport-github2 <br>
~Your Dataset view (login) & All data view <br>
~API & csv download <br>

# To be Added: <br>
* API paths --> (all data, filtered data); standardize .csv output; test API data in Python program -->  GOAL 1
* further information links: wiki, genetic profile, etc.; up-vote pictures (if logged in and in View More presentation view)
* upvoting action -> 4 highest rated by morphology show in row -> button to view other high rated photos; $get cash for good photo if people download;  scroll images (view all button @ dataViewer view --> presentation view)
* add blog code to forum
<br>
~Machine learning species identifier (within add.ejs view) <br>
* Identification (on image upload) - should be able to autofill species name; feedback if wrong kingdom/no upload <br>
~identification info: added via chatgpt --> orderby button: Taxonomy, Conservation Status, Invasiveness, Industrial Usage, Nutrition, Toxicity (Developer does not hardcode, chatgpt adds info to mongoDB) <br>
~after info added, searchBar can search by taxonomy, etc.


