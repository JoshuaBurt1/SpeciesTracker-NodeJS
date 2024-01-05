# SpeciesTracker
concept biological catalogue <br>
https://speciestracker2.azurewebsites.net/

# To Start: <br>
Download zip, open in code editor <br>
In terminal: nodemon

# Capabilities <br>
~CRUD, Multiple tables <br>
~Search bar (by name only) <br>
~Image upload: npm i multer <br>
~Date, time, gps autofill: npm/exif-js <br>
~Coordinates to map & map to coordinates: npm i leaflet <br>
~User authentication & github auth: npm i passport express-session passport-local-mongoose passport-github2 <br>
~Your Dataset view - visible on login <br>
~All users entries view; no login required

# To be Added: <br>
*2 formats: <br>
A. Your Dataset (user) <br>
* Identification (on image upload) - should be able to autofill species name; feedback if wrong kingdom/no upload
& B. Browse all users entries <br>
* click to enlarge map
* API paths based on search results (~all, ~by kingdom, ~by name); test json output GOAL 1
* Within DataViewer chart, each entry has "View More" button --> goes to presentation view with all pictures, data, etc. GOAL 2

* further information links: wiki, genetic profile, etc.; up-vote pictures (if logged in and in View More presentation view)
* upvoting action -> 4 highest rated by morphology show in row -> button to view other high rated photos; $get cash for good photo if people download
* add blog code to forum <br>
<br>
~Machine learning species identifier (within add.ejs view) <br>
~identification info: added via chatgpt --> orderby button: Taxonomy, Conservation Status, Invasiveness, Industrial Usage, Nutrition, Toxicity (Developer does not hardcode, chatgpt adds info to mongoDB) <br>
~after info added, searchBar can search by taxonomy, etc.


