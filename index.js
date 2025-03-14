function fetchWeatherData(city) {
    const apiKey = 'aaa776b8602cae96a312c1e3c5c27b1c';
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            displayCurrentWeather(data);

            const { lat, lon } = data.coord;
            const sunriseTime = data.sys.sunrise;
            const sunsetTime = data.sys.sunset;

            // Set background based on time of day
            if (typeof setDayNightBackground === 'function') {
                setDayNightBackground(sunriseTime, sunsetTime);
            }

            L.marker([lat, lon])
                .addTo(map)
                .bindPopup(`Current Weather: ${data.main.temp}°C`)
                .openPopup();
        })
        .catch(error => {
            console.error('Error fetching current weather:', error);
            const weatherDetails = document.getElementById('weather-details');
            weatherDetails.innerHTML = `
            <div class="error-message">
                <img src="./images/error.png" alt="Error" style="width: 80px; height: 80px; margin-bottom: 1rem;">
                <p>City not found or error fetching data. Please try again.</p>
            </div>
            `;
        });

    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => {
            displayForecast(data);
        })
        .catch(error => {
            console.error('Error fetching forecast:', error);
        });
}

function displayCurrentWeather(data) {
    const weatherDetails = document.getElementById('weather-details');
    const weatherCondition = data.weather[0].main.toLowerCase();
    let weatherIconSrc;

    // Get current time period
    const timePeriod = document.body.getAttribute('data-time-period') || 'day';

    // Determine the appropriate weather icon based on condition and time of day
    switch (weatherCondition) {
        case 'clear':
            if (timePeriod === 'night') {
                weatherIconSrc = './images/clear-night.png';
            } else {
                weatherIconSrc = './images/clear-sky.png';
            }
            break;
        case 'clouds':
            if (timePeriod === 'night') {
                weatherIconSrc = './images/cloudy-night.png';
            } else {
                weatherIconSrc = './images/clouds.png';
            }
            break;
        case 'mist':
        case 'haze':
        case 'fog':
            weatherIconSrc = './images/mist.png';
            break;
        case 'rain':
        case 'drizzle':
            weatherIconSrc = './images/heavy-rain.png';
            break;
        case 'snow':
            weatherIconSrc = './images/snowy.png';
            break;
        case 'thunderstorm':
            weatherIconSrc = './images/thunderstorm.png';
            break;
        default:
            weatherIconSrc = './images/Weather clouds.png';
            break;
    }

    // If the image doesn't exist, fallback to default
    const img = new Image();
    img.onerror = function () {
        weatherIconSrc = './images/Weather clouds.png';
    };
    img.src = weatherIconSrc;

    // Format sunrise and sunset times
    const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Get time period specific class
    const timePeriodClass = `time-${timePeriod}`;

    // Create the HTML for the current weather display
    const weatherHtml = `
        <div class="current-weather-container ${timePeriodClass}">
            <div class="current-location">${data.name}, ${data.sys.country}</div>
            <div class="current-weather-content">
                <div class="current-weather-primary">
                    <div class="current-temp">${Math.round(data.main.temp)}°C</div>
                    <div class="current-condition">${data.weather[0].description}</div>
                    <div class="current-weather-secondary">
                        <div class="current-weather-detail">
                            <i class="fas fa-wind"></i>
                            <div>
                                <div class="current-weather-detail-label">Wind Speed</div>
                                <div class="current-weather-detail-value">${data.wind.speed} m/s</div>
                            </div>
                        </div>
                        <div class="current-weather-detail">
                            <i class="fas fa-tint"></i>
                            <div>
                                <div class="current-weather-detail-label">Humidity</div>
                                <div class="current-weather-detail-value">${data.main.humidity}%</div>
                            </div>
                        </div>
                        <div class="current-weather-detail">
                            <i class="fas fa-compress-arrows-alt"></i>
                            <div>
                                <div class="current-weather-detail-label">Pressure</div>
                                <div class="current-weather-detail-value">${data.main.pressure} hPa</div>
                            </div>
                        </div>
                        <div class="current-weather-detail">
                            <i class="fas fa-eye"></i>
                            <div>
                                <div class="current-weather-detail-label">Visibility</div>
                                <div class="current-weather-detail-value">${(data.visibility / 1000).toFixed(1)} km</div>
                            </div>
                        </div>
                    </div>
                </div>
                <img src="${weatherIconSrc}" alt="${data.weather[0].description}" class="current-weather-image">
            </div>
            <div class="sun-times">
                <div class="sun-time-item">
                    <i class="fas fa-sun"></i>
                    <div>
                        <div class="sun-time-label">Sunrise</div>
                        <div class="sun-time-value">${sunriseTime}</div>
                    </div>
                </div>
                <div class="sun-time-item">
                    <i class="fas fa-moon"></i>
                    <div>
                        <div class="sun-time-label">Sunset</div>
                        <div class="sun-time-value">${sunsetTime}</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    weatherDetails.innerHTML = weatherHtml;

    // Remove the separate sunrise-sunset section since it's now integrated
    const sunriseSunsetSection = document.getElementById('sunrise-sunset-details');
    if (sunriseSunsetSection) {
        sunriseSunsetSection.innerHTML = '';
    }
}

function displayForecast(data) {
    const forecastDetails = document.getElementById('forecast-details');
    forecastDetails.innerHTML = '';

    // Get current time period
    const timePeriod = document.body.getAttribute('data-time-period') || 'day';

    // Get forecasts for the next 5 days at noon
    const forecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));

    forecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const weatherCondition = forecast.weather[0].main.toLowerCase();
        let weatherIconSrc;

        // Determine the appropriate weather icon
        switch (weatherCondition) {
            case 'clear':
                weatherIconSrc = './images/clear-sky.png';
                break;
            case 'clouds':
                weatherIconSrc = './images/clouds.png';
                break;
            case 'mist':
            case 'haze':
            case 'fog':
                weatherIconSrc = './images/mist.png';
                break;
            case 'rain':
            case 'drizzle':
                weatherIconSrc = './images/heavy-rain.png';
                break;
            case 'snow':
                weatherIconSrc = './images/snowy.png';
                break;
            case 'thunderstorm':
                weatherIconSrc = './images/thunderstorm.png';
                break;
            default:
                weatherIconSrc = './images/Weather clouds.png';
                break;
        }

        // Create forecast card with time period class
        const forecastHtml = `
            <div class="forecast-card time-${timePeriod}">
                <div class="forecast-date">${date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div class="forecast-time">${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                <img src="${weatherIconSrc}" alt="${forecast.weather[0].description}" class="forecast-icon">
                <div class="forecast-temp">${Math.round(forecast.main.temp)}°C</div>
                <div class="forecast-description">${forecast.weather[0].description}</div>
                <div class="forecast-details-mini">
                    <span><i class="fas fa-tint"></i> ${forecast.main.humidity}%</span>
                    <span><i class="fas fa-wind"></i> ${forecast.wind.speed} m/s</span>
                </div>
            </div>
        `;
        forecastDetails.innerHTML += forecastHtml;
    });
}

document.getElementById('search-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const city = document.getElementById('city-input').value;
    fetchWeatherData(city);
});

const defaultCity = 'Delhi';
fetchWeatherData(defaultCity);

