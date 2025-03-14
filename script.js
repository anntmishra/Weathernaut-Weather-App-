var map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Function to set background based on time of day
function setDayNightBackground(sunriseTime, sunsetTime) {
    const currentTime = new Date().getTime() / 1000;

    // Calculate evening time (2 hours before sunset)
    const eveningTime = sunsetTime - (2 * 60 * 60);

    // Remove any existing background classes
    document.body.classList.remove('day-background', 'evening-background', 'night-background', 'dark-mode');

    // Determine time of day
    let timePeriod = '';
    let timeIcon = '';

    if (currentTime > sunriseTime && currentTime < eveningTime) {
        // Day time
        timePeriod = 'day';
        timeIcon = 'fa-sun';
        document.body.classList.add('day-background');
    } else if (currentTime >= eveningTime && currentTime < sunsetTime) {
        // Evening time (sunset approaching)
        timePeriod = 'evening';
        timeIcon = 'fa-cloud-sun';
        document.body.classList.add('evening-background');
        document.body.classList.add('dark-mode'); // Add dark mode for evening
    } else {
        // Night time
        timePeriod = 'night';
        timeIcon = 'fa-moon';
        document.body.classList.add('night-background');
        document.body.classList.add('dark-mode'); // Add dark mode for night
    }

    // Add a data attribute to show current time period
    document.body.setAttribute('data-time-period', timePeriod);

    // Update the time indicator in the header
    const timeIndicator = document.getElementById('time-indicator');
    const timePeriodText = document.getElementById('time-period-text');

    if (timeIndicator && timePeriodText) {
        // Update the icon
        const iconElement = timeIndicator.querySelector('i');
        if (iconElement) {
            iconElement.className = `fas ${timeIcon}`;
        }

        // Update the text
        timePeriodText.textContent = timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1);
    }
}

// Handle form submission
document.addEventListener('DOMContentLoaded', function () {
    const searchForm = document.getElementById('search-form');
    const cityInput = document.getElementById('city-input');
    const mapControlBtns = document.querySelectorAll('.map-control-btn');

    // Map layer controls
    mapControlBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // Remove active class from all buttons
            mapControlBtns.forEach(b => b.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Change map layer based on data-layer attribute
            const layer = this.getAttribute('data-layer');
            changeMapLayer(layer);
        });
    });

    // Search form submission
    if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const city = cityInput.value.trim();
            if (city) {
                // Call the fetchWeatherData function from index.js
                if (typeof fetchWeatherData === 'function') {
                    fetchWeatherData(city);
                    fetchAirQuality(city);
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
            fetchAirQuality('New York');
        }
    }, 1000);
});

// Function to change map layer
function changeMapLayer(layer) {
    // Remove existing overlay layers
    map.eachLayer(function (mapLayer) {
        if (mapLayer._url !== 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png') {
            map.removeLayer(mapLayer);
        }
    });

    // Add new layer based on selection
    const apiKey = 'aaa776b8602cae96a312c1e3c5c27b1c'; // Using the same API key from index.js

    switch (layer) {
        case 'temp':
            L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
                maxZoom: 19,
                opacity: 0.7
            }).addTo(map);
            break;
        case 'precipitation':
            L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
                maxZoom: 19,
                opacity: 0.7
            }).addTo(map);
            break;
        case 'wind':
            L.tileLayer(`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
                maxZoom: 19,
                opacity: 0.7
            }).addTo(map);
            break;
        case 'clouds':
            L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
                maxZoom: 19,
                opacity: 0.7
            }).addTo(map);
            break;
    }
}

// Function to fetch air quality data
function fetchAirQuality(city) {
    const apiKey = 'aaa776b8602cae96a312c1e3c5c27b1c'; // Using the same API key from index.js

    // First get coordinates for the city
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const { lat, lon } = data.coord;

            // Then fetch air quality data using coordinates
            return fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
        })
        .then(response => response.json())
        .then(data => {
            displayAirQuality(data);
        })
        .catch(error => {
            console.error('Error fetching air quality data:', error);
            document.getElementById('air-quality-container').innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Unable to fetch air quality data. Please try again later.</p>
                </div>
            `;
        });
}

// Function to display air quality data
function displayAirQuality(data) {
    const airQualityContainer = document.getElementById('air-quality-container');
    const aqi = data.list[0].main.aqi;

    // AQI labels and colors
    const aqiLabels = [
        'Good',
        'Fair',
        'Moderate',
        'Poor',
        'Very Poor'
    ];

    const aqiColors = [
        '#3ebd93', // Good - Green
        '#a1c96a', // Fair - Light Green
        '#ffcf56', // Moderate - Yellow
        '#ff9a3c', // Poor - Orange
        '#e63757'  // Very Poor - Red
    ];

    // AQI descriptions
    const aqiDescriptions = [
        'Air quality is considered satisfactory, and air pollution poses little or no risk.',
        'Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people.',
        'Members of sensitive groups may experience health effects. The general public is not likely to be affected.',
        'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.',
        'Health warnings of emergency conditions. The entire population is more likely to be affected.'
    ];

    // Get pollutant data
    const pollutants = data.list[0].components;

    // Create gauge visualization
    const gaugeHTML = createAQIGauge(aqi, aqiColors);

    // Create pollutants grid
    let pollutantsHTML = '';
    const pollutantNames = {
        co: 'Carbon Monoxide',
        no: 'Nitric Oxide',
        no2: 'Nitrogen Dioxide',
        o3: 'Ozone',
        so2: 'Sulfur Dioxide',
        pm2_5: 'PM2.5',
        pm10: 'PM10',
        nh3: 'Ammonia'
    };

    for (const [key, value] of Object.entries(pollutants)) {
        pollutantsHTML += `
            <div class="pollutant-card">
                <div class="pollutant-name">${pollutantNames[key] || key}</div>
                <div class="pollutant-value">${value.toFixed(2)} μg/m³</div>
            </div>
        `;
    }

    // Update the container
    airQualityContainer.innerHTML = `
        <div class="aqi-gauge">${gaugeHTML}</div>
        <div class="aqi-value" style="color: ${aqiColors[aqi - 1]};">${aqi}</div>
        <div class="aqi-label">${aqiLabels[aqi - 1]}</div>
        <p class="aqi-description">${aqiDescriptions[aqi - 1]}</p>
        <div class="pollutants-grid">
            ${pollutantsHTML}
        </div>
    `;
}

// Function to create AQI gauge visualization
function createAQIGauge(aqi, colors) {
    // Simple gauge visualization using SVG
    return `
        <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
            <!-- Background arc -->
            <path d="M 10 90 A 90 90 0 0 1 190 90" stroke="#e2e8f0" stroke-width="10" fill="none" />
            
            <!-- Colored segments -->
            <path d="M 10 90 A 90 90 0 0 1 55 90" stroke="${colors[0]}" stroke-width="10" fill="none" />
            <path d="M 55 90 A 90 90 0 0 1 100 90" stroke="${colors[1]}" stroke-width="10" fill="none" />
            <path d="M 100 90 A 90 90 0 0 1 145 90" stroke="${colors[2]}" stroke-width="10" fill="none" />
            <path d="M 145 90 A 90 90 0 0 1 190 90" stroke="${colors[3]}" stroke-width="10" fill="none" />
            
            <!-- Needle -->
            <line x1="100" y1="90" x2="${10 + (aqi - 1) * 45}" y2="50" stroke="${colors[aqi - 1]}" stroke-width="3" />
            <circle cx="100" cy="90" r="5" fill="${colors[aqi - 1]}" />
        </svg>
    `;
}
