

function fetchWeatherData(city) {
    const apiKey = 'aaa776b8602cae96a312c1e3c5c27b1c';
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            displayCurrentWeather(data);

            const { lat, lon } = data.coord;
            const currentTime = new Date().getTime() / 1000;
            const sunriseTime = data.sys.sunrise;
            const sunsetTime = data.sys.sunset;

            if (currentTime > sunriseTime && currentTime < sunsetTime) {
                document.body.style.backgroundImage = 'url("./images/bram-bergers-YHaNHQXFIhU-unsplash.jpg")';
            } else {
                document.body.style.backgroundImage = 'url("./images/bram-bergers-YHaNHQXFIhU-unsplash 2.jpg")';
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
            <img src="./images/error.png" alt="Error">
            <p>City not found or error fetching data. Please try again.</p>
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
    let weatherIcon;
    switch (weatherCondition) {
        case 'clear':
            weatherIcon = '<img src="./images/clear-sky.png" alt="Clear">';
            break;
        case 'clouds':
            weatherIcon = '<img src="./images/clouds.png" alt="Cloudy">';
            break;
        case 'mist':
            weatherIcon = '<img src="./images/mist.png" alt="Mist">';
            break;
        case 'rain':
            weatherIcon = '<img src="./images/heavy-rain.png" alt="Rain">';
            break;
        case 'snow':
            weatherIcon = '<img src="./images/snowy.png" alt="Snow">';
            break;
        default:
            weatherIcon = '<img src="./images/sun.png" alt="Weather">';
            break;
    }
    const weatherHtml = `
        <h2 style="font-size: 24px">${data.name}, ${data.sys.country}</h2>
        <p style="font-size: 18px">Temperature: ${data.main.temp}°C</p>
        <p style="font-size: 18px">Weather: ${data.weather[0].description}</p>
        <p style="font-size: 18px">Sunrise: ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}</p>
        <p style="font-size: 18px">Sunset: ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}</p>
        <div class="weather-info">
            <div class="weather-info-item">
                <p style="font-size: 18px">Wind Speed: ${data.wind.speed} m/s</p>
            </div>
            <div class="weather-info-item">
                <p style="font-size: 18px">Humidity: ${data.main.humidity}%</p>
            </div>
        </div>
        ${weatherIcon}
    `;
    weatherDetails.innerHTML = weatherHtml;
}

function displayForecast(data) {
    const forecastDetails = document.getElementById('forecast-details');
    forecastDetails.innerHTML = '';

    const forecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));
    forecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const forecastHtml = `
            <div class="forecast-card">
                <h3>${date.toLocaleDateString('en-US', { weekday: 'short' })}</h3>
                <p>Temperature: ${forecast.main.temp}°C</p>
                <p>Weather: ${forecast.weather[0].description}</p>
            </div>
        `;
        forecastDetails.innerHTML += forecastHtml;
    });
}

document.getElementById('search-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const city = document.getElementById('city-input').value;
    fetchWeatherData(city);
});

const defaultCity = 'Delhi';
fetchWeatherData(defaultCity);

