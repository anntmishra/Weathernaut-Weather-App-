var map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

require('dotenv').config();

// Example environment variable usage
const apiKey = process.env.API_KEY;

// Ensure apiKey is defined before using it further in your code
if (!apiKey) {
    console.error('API_KEY is not defined in the environment variables.');
    process.exit(1); // Exit the process if API_KEY is not defined
}
