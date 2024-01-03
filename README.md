# SpeciesTracker
concept biological catalogue <br>
https://speciestracker2.azurewebsites.net/

# To Start: <br>
Download zip, open in code editor <br>
In terminal: nodemon

# Capabilities <br>
CRUD, Multiple tables <br>
image upload: npm i multer <br>
date, time, gps autofill: npm/exif-js <br>
coordinates to map & map to coordinates: npm i leaflet <br>
search bar (by name only) <br>

# To be Added: <br>
*2 formats: <br>
*#A.# Your Dataset (user)<br>
*Add user login (user can only view own photos here)<br>  
*on registration mk.dir -> file storage format (each user has _id directory, sub directories = plants/animals/protists/fungi)<br>  
<br>
*#B.# Browse all users entries (with all locations & time on a single map ->if name same -->add to date, location, image array)<br>
*further information links: wiki, genetic profile, etc.; up-vote pictures <br>
*upvoting action -> 4 highest rated by morphology show in row -> button to view other high rated photos <br>
<br>
*#C.# add blog code to forum <br>
<br>
~Machine learning species identifier <br>
~identification info: added via chatgpt --> orderby button: Taxonomy, Conservation Status, Invasiveness, Industrial Usage, Nutrition, Toxicity (Developer does not hardcode, chatgpt adds info to mongoDB) <br>
~after info added, searchBar can search by taxonomy, etc.


