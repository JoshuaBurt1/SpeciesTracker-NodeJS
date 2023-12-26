//Obtains image "date taken" data from properties --> details --> date taken
document.addEventListener('DOMContentLoaded', function () {
  const fileInput = document.getElementById('image');
  const dateInput = document.getElementById('updateDate');

  fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const buffer = e.target.result;

      // Use exif-js to read EXIF data from the image buffer
      EXIF.getData(file, function () {
        // Access the "Date Taken" information
        const dateTaken = EXIF.getTag(this, 'DateTimeOriginal');
        console.log('Date Taken:', dateTaken);

        // Update the updateDate input with the "Date Taken" information
        if (dateTaken) {
          dateInput.value = dateTaken;
          console.log('Date Taken:', dateInput.value);
        }
      });
    };

    reader.readAsArrayBuffer(file);
  });
});