document.addEventListener('DOMContentLoaded', function () {
    const downloadCsvLink = document.getElementById('downloadCsvLink');
    const csvInfo = document.getElementById('csvInfo');
    const downloadImageLink = document.getElementById('downloadImageLink');
    const imageInfo = document.getElementById('imageInfo');

    // Fetch CSV file size
    fetch('/api/download-csv')
        .then(response => response.blob())
        .then(blob => {
            const sizeKB = Math.round(blob.size / 1024); // Convert bytes to KB
            csvInfo.textContent = `${sizeKB} KB`;
        })
        .catch(error => console.error('Error fetching CSV file:', error));
    // Fetch image directory size and last modified date from the server
    fetch('/images-info')
        .then(response => response.json())
        .then(data => {
            const sizeGB = (data.size / (1024 * 1024 * 1024)).toFixed(1); // Convert bytes to GB
            imageInfo.textContent = `${sizeGB} GB`;
        })
        .catch(error => console.error('Error fetching image directory info:', error));
});