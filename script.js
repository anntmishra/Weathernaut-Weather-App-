var map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Handle form submission
document.addEventListener('DOMContentLoaded', function () {
    const searchForm = document.getElementById('search-form');
    const cityInput = document.getElementById('city-input');

    if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const city = cityInput.value.trim();
            if (city) {
                // Call the fetchWeatherData function from index.js
                if (typeof fetchWeatherData === 'function') {
                    fetchWeatherData(city);
                } else {
                    console.error('fetchWeatherData function not found');
                }
            }
        });
    }

    // Set default city if none is searched yet
    setTimeout(() => {
        if (typeof fetchWeatherData === 'function' &&
            document.getElementById('weather-details').innerHTML.trim() === '') {
            fetchWeatherData('New York');
        }
    }, 1000);
});
