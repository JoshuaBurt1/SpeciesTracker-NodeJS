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
~User's data view (Your Dataset) visible on login
~Browse all users entries; no login required

# To be Added: <br>
*2 formats: A. Your Dataset (user) & B. Browse all users entries 
*(-- search by kingdom (plantae, animalia, etc.) --all locations & time on a single map ->if name same -->add to date, location, image array);
*further information links: wiki, genetic profile, etc.; up-vote pictures <br>
*upvoting action -> 4 highest rated by morphology show in row -> button to view other high rated photos <br>
*add blog code to forum <br>
<br>
~Machine learning species identifier (within add.ejs view) <br>
~identification info: added via chatgpt --> orderby button: Taxonomy, Conservation Status, Invasiveness, Industrial Usage, Nutrition, Toxicity (Developer does not hardcode, chatgpt adds info to mongoDB) <br>
~after info added, searchBar can search by taxonomy, etc.


