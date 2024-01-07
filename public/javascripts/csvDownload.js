document.addEventListener('DOMContentLoaded', function () {
    const downloadCsvLink = document.getElementById('downloadCsvLink');

    downloadCsvLink.addEventListener('click', function () {
      // Send an AJAX request to the download endpoint
      fetch('/api/download-csv')
        .then(response => response.blob())
        .then(blob => {
          // Create a temporary link and trigger a download
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = 'speciesData.csv';
          link.click();
        })
        .catch(error => console.error('Error downloading CSV:', error));
    });
  });