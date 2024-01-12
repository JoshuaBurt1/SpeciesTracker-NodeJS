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
~Your Dataset view (login) & All data view <br>
~API & csv download <br>
~User authentication & github auth: npm i passport express-session passport-local-mongoose passport-github2 <br>
~Message board (Forum) with reply <br>
~Admin privileges (Edit and delete any post) <br>

# To be Added: <br>
* Message board: 
* Admin login vs user login: admin can add and delete message board topics, delete user; change blog post category from webpage rather than modifying MongoDB (admin value is null on registration unless manually added to database)
* add a route for category -> blog -> replies 
* last blog post & time displayed at category view @ Posted By 
* last reply post & time displayed on blog view @ Posted By 
* posted edited marker and time, if occurred
* views, unique views
* allow users to insert attachments/images into post
<br>

* APIs:
* output API paths --> (all data, filtered data); standardize .csv output; test API data in Python program
* Input of other API links into this database (Program 2: copy GitHub code, run -> generate API output --> received by Program 1 (this), now Program 2 data in Program 1); distributed computing (API data can be turned on/off)
<br>

* Data Viewer (Wild):
* further animal/plant/fungi/protist information via show.ejs --> wiki, genetic profile, etc.; up-vote pictures (if logged in and in View More presentation view) -->  OrderBy button functionality
* upvoting action -> 4 highest rated by morphology show in row -> button to view other high rated photos; $get cash for good photo if people download;  scroll images (view all button @ dataViewer view --> presentation view)
* Other data viewer: standardized (Production) & (Identification) datasets
<br>

* Overall Data: 
* Ban user & delete associated info by user email function; AND/OR disassociate with more likely true data until "threshold %" reached
<br>

* Machine Learning:
* Machine learning species identifier (within add.ejs view) 
* Identification (on image upload) - should be able to autofill species name; feedback if wrong kingdom/no upload
* identification info: added via chatgpt --> orderby button: Taxonomy, Conservation Status, Invasiveness, Industrial Usage, Nutrition, Toxicity (Developer does not hardcode, chatgpt adds info to mongoDB)
* after info added, searchBar can search by taxonomy, etc.


