function initAutocomplete() {
  const input = document.getElementById("city-search");
  const autocomplete = new google.maps.places.Autocomplete(input, {
    types: ["(cities)"],
  });

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry) {
      console.error("Autocomplete's returned place contains no geometry");
      return;
    }
    const city = place.name;
    fetchWeather(city);
    fetchForecast(city);
  });
}

// Initialize autocomplete when the window loads
window.onload = initAutocomplete;
