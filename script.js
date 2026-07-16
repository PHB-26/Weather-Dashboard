const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const themeBtn = document.getElementById("themeBtn");

const cityName = document.getElementById("cityName");
const currentDate = document.getElementById("currentDate");
const temperature = document.getElementById("temperature");
const weatherCondition = document.getElementById("weatherCondition");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const forecastContainer = document.getElementById("forecastContainer");

const weather = {
    0: "☀️ Clear",
    1: "🌤️ Mostly Clear",
    2: "⛅ Partly Cloudy",
    3: "☁️ Cloudy",
    61: "🌧️ Rain",
    63: "🌧️ Heavy Rain",
    71: "❄️ Snow",
    95: "⛈️ Thunderstorm"
};

currentDate.textContent = new Date().toDateString();

async function getWeather(lat, lon, place) {

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;

    const response = await fetch(url);
    const data = await response.json();

    cityName.textContent = place;
    temperature.textContent = `${Math.round(data.current.temperature_2m)}°C`;
    feelsLike.textContent = `${Math.round(data.current.apparent_temperature)}°C`;
    humidity.textContent = `${data.current.relative_humidity_2m}%`;
    windSpeed.textContent = `${data.current.wind_speed_10m} km/h`;

    const currentWeather = weatherIcons[data.current.weather_code];

if (currentWeather) {
    weatherCondition.textContent =
        `${currentWeather.icon} ${currentWeather.text}`;
} else {
    weatherCondition.textContent = "🌤️ Weather";
}

    showForecast(data.daily);
}

function showForecast(daily) {

    forecastContainer.innerHTML = "";

    for (let i = 0; i < 7; i++) {

        const date = new Date(daily.time[i]);

        forecastContainer.innerHTML += `
            <div class="forecast-card">
                <h4>${date.toLocaleDateString("en-US", { weekday: "short" })}</h4>
                <p>
                ${weatherIcons[daily.weather_code[i]]
                    ? weatherIcons[daily.weather_code[i]].icon
                            : "🌤️"}
</p>
                <p>${Math.round(daily.temperature_2m_max[i])}°C</p>
                <small>${Math.round(daily.temperature_2m_min[i])}°C</small>
            </div>
        `;
    }
}

async function searchCity() {

    const city = cityInput.value.trim();

    if (city === "") return;

    const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
    );

    const data = await response.json();

    if (!data.results) {
        alert("City not found");
        return;
    }

    const place = data.results[0];

    getWeather(place.latitude, place.longitude, place.name);
}

function currentLocation() {

    navigator.geolocation.getCurrentPosition(async (position) => {

        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}`
        );

        const data = await response.json();

        getWeather(lat, lon, data.results[0].name);

    });
}

searchBtn.addEventListener("click", searchCity);

cityInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        searchCity();
    }
});

locationBtn.addEventListener("click", currentLocation);

themeBtn.addEventListener("click", function () {
    document.body.classList.toggle("dark");
});

currentLocation();