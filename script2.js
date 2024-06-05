document.addEventListener("DOMContentLoaded", () => {
  const API_KEY = "785b79dcf3fdd886f803061b8d0a2e78";
  const locationElement = document.getElementById("location");
  const currentWeatherElement = document.getElementById("current-weather");
  const tempElement = document.getElementById("temperature");
  const humidityElement = document.getElementById("humidity-value");
  const windSpeedElement = document.getElementById("wind-speed-value");
  const windDirectionElement = document.getElementById("wind-direction-value");
  const forecastElement = document.getElementById("forecast");

  document.getElementById("menu-button").addEventListener("click", () => {
    const menuContent = document.getElementById("menu-content");
    menuContent.style.display =
      menuContent.style.display === "flex" ? "none" : "flex";
  });

  // get weather details
  async function fetchWeather(city) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Weather Data:", data);
      updateWeather(data);
      setContainerBackground(data.weather[0].main.toLowerCase());
      addSearchHistory(city); // Add city to search history
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  }

  // get the users location
  function getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          fetchWeatherByCoords(lat, lon);
        },
        (error) => {
          console.error("Error getting location:", error);
          fetchWeather("Johannesburg"); // Fallback to default location
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      fetchWeather("Johannesburg"); // Fallback to default location
    }
  }

  //fetch weather data using coordinates
  async function fetchWeatherByCoords(lat, lon) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Weather Data by Coords:", data);
      updateWeather(data);
      setContainerBackground(data.weather[0].main.toLowerCase());
    } catch (error) {
      console.error("Error fetching weather data:", error);
      updateWeather({
        name: "Error",
        weather: [{ description: "Unable to fetch weather data" }],
        main: { temp: "--", humidity: "--" },
        wind: { speed: "--", deg: "--" },
      });
    }
  }

  // Ading a search history
  function addSearchHistory(city) {
    let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

    // Check if the city is already in the history
    if (!searchHistory.includes(city)) {
      searchHistory.push(city);

      // Keep only last 5 searches
      if (searchHistory.length > 5) {
        searchHistory.shift();
      }

      localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    }

    displaySearchHistory();
  }

  //display search history
  function displaySearchHistory() {
    const searchHistory =
      JSON.parse(localStorage.getItem("searchHistory")) || [];
    const historyElement = document.getElementById("search-history");

    historyElement.innerHTML = "";

    searchHistory.forEach((city) => {
      const cityElement = document.createElement("div");
      cityElement.textContent = city;
      cityElement.className = "history-item";
      cityElement.addEventListener("click", () => fetchWeather(city));
      historyElement.appendChild(cityElement);
    });
  }

  // update weather details
  function updateWeather(data) {
    locationElement.textContent = data.name;
    currentWeatherElement.textContent = `${data.weather[0].description} ${data.main.temp}°C`;

    humidityElement.textContent = data.main.humidity;
    windSpeedElement.textContent = data.wind.speed;
    windDirectionElement.textContent = data.wind.deg;
  }

  // set background videos //
  function setContainerBackground(weatherCondition) {
    const video = document.getElementById("background-video");
    if (weatherCondition.includes("clear")) {
      video.src = "Videos/ClearLowquality.mp4";
    } else if (weatherCondition.includes("clouds")) {
      video.src = "Videos/Cloudy.mp4";
    } else if (weatherCondition.includes("rain")) {
      video.src = "Videos/Rainy.mp4";
    } else if (weatherCondition.includes("thunderstorm")) {
      video.src = "Videos/Thunderstorm.mp4";
    } else if (weatherCondition.includes("snow")) {
      video.src = "Videos/Snowy.mp4";
    } else {
      video.src = "path/to/default-background.mp4";
    }
  }

  document.getElementById("search-button").addEventListener("click", () => {
    const city = document.getElementById("city-search").value;
    fetchWeather(city);
    fetchForecast(city);
  });

  async function fetchForecast(city) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Forecast Data:", data);
      updateForecast(data);
    } catch (error) {
      console.error("Error fetching forecast data:", error);
    }
  }

  function updateForecast(data) {
    forecastElement.innerHTML = "";
    const forecast = data.list.filter((item) =>
      item.dt_txt.includes("12:00:00")
    );
    forecast.slice(0, 4).forEach((day) => {
      const dayElement = document.createElement("div");
      dayElement.classList.add("day");

      const date = new Date(day.dt_txt).toLocaleDateString(undefined, {
        weekday: "short",
      });
      const temp = `${day.main.temp}°C`;
      const description = day.weather[0].description;
      const icon = `http://openweathermap.org/img/wn/${day.weather[0].icon}.png`;

      dayElement.innerHTML = `
                <img src="${icon}" alt="${description}" class="weather-icon">
                <div class="day-name">${date}</div>
                <div class="temperature">${temp}</div>
            `;
      forecastElement.appendChild(dayElement);
    });
  }

  const defaultCity = "Durban";
  document
    .getElementById("get-location")
    .addEventListener("click", getUserLocation);
  fetchWeather(defaultCity);
  fetchForecast(defaultCity);
  getUserLocation();
  displaySearchHistory();
});
