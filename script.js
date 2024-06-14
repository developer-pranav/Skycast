// Prompt the user to enter their API key for the weather service
const apiKey = prompt("Please enter your API key from OpenWeatherMap to proceed:"); //You can remove this prompt and add Ypur Api key here, So that u didn't need to re-entered it again

// Also Remove this Part
if (!apiKey) {
    alert("API key is required to use this application. Please obtain an API key from https://openweathermap.org/ and try again.");
    throw new Error("API key is missing");
}



// DOM elements
const current = document.getElementById('currDeg');
const weather = document.getElementById('weather');
const weatherIcon = document.getElementById("weatherIcon");
const date = document.getElementById('date');
const locate = document.getElementById('location');
const aqi = document.querySelector('.bdg');
const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');
const feels = document.getElementById('feels');
const humidity = document.getElementById('humidity');
const pressure = document.getElementById('pressure');

const apiUrl = "https://api.openweathermap.org/data/2.5/weather?";
const forecastApiUrl = "https://api.openweathermap.org/data/2.5/forecast?";
const aqiUrl = "http://api.openweathermap.org/data/2.5/air_pollution/forecast?";
const searchBox = document.querySelector(".searchInput");
const searchBtn = document.querySelector(".searchBtn");
const daysName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getLocation() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                currentData(latitude, longitude);
            },
            function (error) {
                console.log('Error:', error.message);
            }
        );
    } else {
        console.log('Geolocation is not supported by this Browser');
    }
}

async function currentData(lat, lon) {
    const response = await fetch(`${apiUrl}lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    const fetched = await response.json();
    updateData(fetched);

    const aqif = await fetch(`${aqiUrl}lat=${lat}&lon=${lon}&appid=${apiKey}`);
    const aqifetched = await aqif.json();
    updateAQI(aqifetched);

    getWeatherForecast(lat, lon);
}

async function checkWeather(city) {
    const response = await fetch(`${apiUrl}q=${city}&appid=${apiKey}&units=metric`);
    const fetched = await response.json();
    updateData(fetched);

    const aqif = await fetch(`${aqiUrl}lat=${fetched.coord.lat}&lon=${fetched.coord.lon}&appid=${apiKey}`);
    const aqifetched = await aqif.json();
    updateAQI(aqifetched);

    getWeatherForecast(fetched.coord.lat, fetched.coord.lon);
}

function updateData(data) {
    console.log(data);

    const d = new Date();
    date.innerHTML = `${daysName[d.getDay()]}, ${d.getDate()} ${monthName[d.getMonth()]}`;
    locate.innerHTML = data.name;
    current.innerHTML = Math.round(data.main.temp) + "°C";
    feels.innerHTML = Math.round(data.main.feels_like) + "°C";
    humidity.innerHTML = data.main.humidity + "%";
    pressure.innerHTML = data.main.pressure + "hPa";

    var unixRise = data.sys.sunrise * 1000;
    var istRise = new Date(unixRise).toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour12: false });
    var dateRise = new Date(istRise);
    var hoursRise = String(dateRise.getHours()).padStart(2, '0');
    var minutesRise = String(dateRise.getMinutes()).padStart(2, '0');
    var timeRise = `${hoursRise}:${minutesRise}`;

    var unixSet = data.sys.sunset * 1000;
    var istSet = new Date(unixSet).toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour12: false });
    var dateSet = new Date(istSet);
    var hoursSet = String(dateSet.getHours()).padStart(2, '0');
    var minutesSet = String(dateSet.getMinutes()).padStart(2, '0');
    var timeSet = `${hoursSet}:${minutesSet}`;

    sunrise.innerHTML = timeRise;
    sunset.innerHTML = timeSet;

    const weatherIconMap = {
        "01d": "sunny.png",
        "01n": "sunny.png",
        "02d": "few-clouds.png",
        "02n": "few-clouds.png",
        "03d": "clouds.png",
        "03n": "clouds.png",
        "04d": "broken-clouds.png",
        "04n": "broken-clouds.png",
        "09d": "rain.png",
        "09n": "rain.png",
        "10d": "rain.png",
        "10n": "rain.png",
        "11d": "storm.png",
        "11n": "storm.png",
        "13d": "snowy.png",
        "13n": "snowy.png",
        "50d": "mist.png",
        "50n": "mist.png",
        "default": "no-data.png"
    };

    const icon = weatherIconMap[data.weather[0].icon] || weatherIconMap["default"];
    weatherIcon.src = `assets/indicator/${icon}`;
    weather.innerHTML = data.weather[0].description;
}

function updateAQI(aqifetched) {
    const aqiData = Math.round(aqifetched.list[0].main.aqi);

    if (aqiData == 1) {
        aqi.innerHTML = "Good";
        aqi.style.backgroundColor = "#50C878";
        aqi.style.color = "#FFFFFF";
    } else if (aqiData == 2) {
        aqi.innerHTML = "Fair";
        aqi.style.backgroundColor = "#FFFF00";
        aqi.style.color = "#000000";
    } else if (aqiData == 3) {
        aqi.innerHTML = "Moderate";
        aqi.style.backgroundColor = "#FF8000";
        aqi.style.color = "#FFFFFF";
    } else if (aqiData == 4) {
        aqi.innerHTML = "Poor";
        aqi.style.backgroundColor = "#FF0000";
        aqi.style.color = "#FFFFFF";
    } else if (aqiData == 5) {
        aqi.innerHTML = "Very Poor";
        aqi.style.backgroundColor = "#8B0000";
        aqi.style.color = "#FFFFFF";
    } else {
        aqi.innerHTML = "Error";
        aqi.style.backgroundColor = "#0080FF";
        aqi.style.color = "#FFFFFF";
    }
}

async function getWeatherForecast(lat, lon) {
    const response = await fetch(`${forecastApiUrl}lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    const data = await response.json();
    displayForecast(data);
}

function displayForecast(data) {
    const dailyForecasts = data.list.filter(item => item.dt_txt.includes("12:00:00"));

    for (let i = 0; i < 5; i++) {
        const day = dailyForecasts[i];
        const temp = `${Math.round(day.main.temp.toFixed(1))} °C`;
        const iconCode = day.weather[0].icon;
        const weatherIconMap = {
            "01d": "sunny.png",
            "01n": "sunny.png",
            "02d": "few-clouds.png",
            "02n": "few-clouds.png",
            "03d": "clouds.png",
            "03n": "clouds.png",
            "04d": "broken-clouds.png",
            "04n": "broken-clouds.png",
            "09d": "rain.png",
            "09n": "rain.png",
            "10d": "rain.png",
            "10n": "rain.png",
            "11d": "storm.png",
            "11n": "storm.png",
            "13d": "snowy.png",
            "13n": "snowy.png",
            "50d": "mist.png",
            "50n": "mist.png",
            "default": "no-data.png"
        };

        const customIconUrl = `assets/indicator/${weatherIconMap[iconCode] || weatherIconMap["default"]}`;

        const dayElement = document.getElementById(`day${i + 1}`);
        const weatherIcon = dayElement.querySelector('img');
        const temperature = dayElement.querySelector('.temp');
        
        weatherIcon.src = customIconUrl
        weatherIcon.alt = day.weather[0].description;
        temperature.textContent = temp
    }
}

searchBtn.addEventListener('click', ()=>{
  console.log('done');
  checkWeather(searchBox.value);
});

// Initial call to get location-based weather data
getLocation();