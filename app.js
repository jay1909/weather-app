const apiKey = 'c2e73a941269964dbc44b7fe3909177d'; 
let isCelsius = true;

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const unitToggle = document.getElementById('unit-toggle');
const errorElement = document.getElementById('error');

// Weather Elements
const tempElement = document.getElementById('temp');
const unitElement = document.getElementById('unit');
const cityElement = document.getElementById('city');
const humidityElement = document.getElementById('humidity');
const windElement = document.getElementById('wind');
const pressureElement = document.getElementById('pressure');
const weatherIcon = document.getElementById('weather-icon');
const forecastCards = document.getElementById('forecast-cards');

// Fetch Weather Data
async function fetchWeather(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
        );
        
        if (!response.ok) throw new Error('City not found');
        
        const data = await response.json();
        displayWeather(data);
        fetchForecast(data.coord.lat, data.coord.lon);
        errorElement.style.display = 'none';
    } catch (error) {
        errorElement.style.display = 'block';
        console.error(error);
    }
}

// Fetch 5-Day Forecast
async function fetchForecast(lat, lon) {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    const data = await response.json();
    displayForecast(data);
}

// Display Current Weather
function displayWeather(data) {
    const temp = isCelsius ? data.main.temp : (data.main.temp * 9/5 + 32);
    tempElement.textContent = Math.round(temp);
    unitElement.textContent = isCelsius ? '°C' : '°F';
    cityElement.textContent = data.name;
    humidityElement.textContent = `${data.main.humidity}%`;
    windElement.textContent = `${data.wind.speed} km/h`;
    pressureElement.textContent = `${data.main.pressure} hPa`;

    // Set Weather Icon
    const weatherMain = data.weather[0].main.toLowerCase();
    switch (weatherMain) {
        case 'clear':
            weatherIcon.className = 'fas fa-sun';
            break;
        case 'clouds':
            weatherIcon.className = 'fas fa-cloud';
            break;
        case 'rain':
            weatherIcon.className = 'fas fa-cloud-rain';
            break;
        case 'snow':
            weatherIcon.className = 'fas fa-snowflake';
            break;
        case 'thunderstorm':
            weatherIcon.className = 'fas fa-bolt';
            break;
        case 'mist':
        case 'fog':
            weatherIcon.className = 'fas fa-smog';
            break;
        default:
            weatherIcon.className = 'fas fa-cloud';
    }
}

// Display 5-Day Forecast
function displayForecast(data) {
    forecastCards.innerHTML = '';
    const dailyForecast = data.list.filter((item, index) => index % 8 === 0).slice(0, 5);

    dailyForecast.forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString('en', { weekday: 'short' });
        const temp = isCelsius ? day.main.temp : (day.main.temp * 9/5 + 32);
        const icon = getWeatherIcon(day.weather[0].main.toLowerCase());

        forecastCards.innerHTML += `
            <div class="forecast-card">
                <p>${date}</p>
                <i class="fas ${icon}"></i>
                <p>${Math.round(temp)}°</p>
            </div>
        `;
    });
}

// Get Weather Icon for Forecast
function getWeatherIcon(weather) {
    switch (weather) {
        case 'clear': return 'fa-sun';
        case 'clouds': return 'fa-cloud';
        case 'rain': return 'fa-cloud-rain';
        case 'snow': return 'fa-snowflake';
        case 'thunderstorm': return 'fa-bolt';
        case 'mist': case 'fog': return 'fa-smog';
        default: return 'fa-cloud';
    }
}

// Get Weather by Geolocation
function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
                );
                const data = await response.json();
                displayWeather(data);
                fetchForecast(latitude, longitude);
            },
            (error) => {
                console.error(error);
                errorElement.textContent = 'Geolocation blocked. Please enable it.';
                errorElement.style.display = 'block';
            }
        );
    } else {
        errorElement.textContent = 'Geolocation not supported.';
        errorElement.style.display = 'block';
    }
}

// Toggle Temperature Unit
function toggleUnit() {
    isCelsius = !isCelsius;
    unitToggle.textContent = isCelsius ? '°C / °F' : '°F / °C';
    const currentCity = cityElement.textContent;
    if (currentCity !== '--') fetchWeather(currentCity);
}

// Event Listeners
searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim()) fetchWeather(cityInput.value.trim());
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && cityInput.value.trim()) {
        fetchWeather(cityInput.value.trim());
    }
});

locationBtn.addEventListener('click', getLocationWeather);
unitToggle.addEventListener('click', toggleUnit);

// Load Default City
fetchWeather('London');