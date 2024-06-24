DEFAULT_CITY_NAME = 'London'
BASE_URL = 'https://my-weather-quillbot-app-dd69b1897888.herokuapp.com/weather'

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('location-form');
    const locationSelect = document.getElementById('location-select');
    const liveTickerForm = document.getElementById('live-ticker-form');

    form.addEventListener('submit', function(event) {
        // event.preventDefault();
        // const selectedLocation = locationSelect.value;

        event.preventDefault();
        const locationInput = document.getElementById('location-input').value.trim();
        
        if (locationInput === '') {
            alert('Please enter a zip code.');
            return;
        }


        getCurrentWeather(locationInput);
        getForecast(locationInput);
    });

    liveTickerForm.addEventListener('change', function() {
        updateLiveTicker();
    });

    // Initial data load on page load (default city: London)
    getCurrentWeather(DEFAULT_CITY_NAME);
    getForecast(DEFAULT_CITY_NAME);
    updateLiveTicker();

    // Start live ticker updates every 30 seconds
    setInterval(() => {
        updateLiveTicker();
    }, 30000);
});

async function getCurrentWeather(location) {
    try {
        const response = await fetch(`${BASE_URL}?city_name=${location}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch current weather data.');
        }

        const currentWeatherData = document.getElementById('current-weather');
        currentWeatherData.innerHTML = `
            <div class="weather-card">
                <h3>${data.location}</h3>
                <p>Temperature: ${data.temperatureInCelcius}°C</p>
                <p>Condition: <img src="https://${data.icon}" alt="Weather Icon"></p>
                <p>Country: ${data.country}</p>
                <p>Time Zone: ${data.timeZone}</p>
            </div>
        `;
    } catch (error) {
        console.error('Error fetching current weather:', error);
        alert('An error occurred while fetching current weather data.');
    }
}

async function getForecast(location, days=2) {
    try {
        const response = await fetch(`${BASE_URL}/forecast?city_name=${location}&days=${days}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch forecast data.');
        }

        const forecastData = document.getElementById('forecast');
        forecastData.innerHTML = `
            <h3>
                ${data.location}
            </h3>
        `;
        
        data.forecastData.forEach(day => {
            let hourlyData = '';
            day.hour.forEach(hour => {
                hourlyData += `
                    <div class="hour-card" >
                        <p>Time: ${hour.time.split(" ")[1]}</p>
                        <p>Temp: ${hour.tempInCelcius}°C</p>
                        <p>Condition: <img src="https://${hour.icon}" alt="Weather Icon"></p>
                    </div>
                `;
            });


            forecastData.innerHTML += `
                <div class="weather-card">
                    <h3>${day.date}</h3>
                    <p>Average Temperature: ${day.avgTempInCelcius}°C</p>
                    <p>Max Temperature: ${day.maxTempInCelcius}°C</p>
                    <p>Min Temperature: ${day.minTempInCelcius}°C</p>
                    <p>Condition: <img src="https://${day.icon}" alt="Weather Icon"></p>
                    <div id="hour-data">${hourlyData}</div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error fetching forecast:', error);
        alert('An error occurred while fetching forecast data.');
    }
}

async function updateLiveTicker() {
    const selectedCities = Array.from(document.querySelectorAll('#live-ticker-form input[type="checkbox"]:checked')).map(cb => cb.value);

    const tickerData = document.getElementById('live-ticker');
    tickerData.innerHTML = '';

    for (const city of selectedCities) {
        try {
            const response = await fetch(`${BASE_URL}?city_name=${city}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Failed to fetch weather data for ${city}.`);
            }

            const tickerItem = document.createElement('div');
            tickerItem.classList.add('live-ticker-card');
            tickerItem.innerHTML = `
                <h3>${data.location}</h3>
                <p>Temperature: ${data.temperatureInCelcius}°C</p>
                <p>Condition: <img src="https://${data.icon}" alt="Weather Icon"></p>
                <p>Country: ${data.country}</p>
                <p>Time Zone: ${data.timeZone}</p>
            `;
            tickerData.appendChild(tickerItem);
        } catch (error) {
            console.error(`Error fetching weather for ${city}:`, error);
            alert(`An error occurred while fetching weather data for ${city}.`);
        }
    }
}
