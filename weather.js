// Initialize the map and marker variables
let map, marker;

// Function to initialize the map
function initMap() {
    // Set the initial coordinates (e.g., a default location)
    const initialCoords = [0, 0];

    // Set your Mapbox access token here
    mapboxgl.accessToken = 'pk.eyJ1IjoiaXRzLW1hbm9qIiwiYSI6ImNscGloYWpmODBncWYya21obG5zcjI0aXAifQ.1do0GHNKjSDLjnTPV14mUg';

    // Create the map with initial coordinates and style
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: initialCoords,
        zoom: 2
    });

    // Add navigation control
    map.addControl(new mapboxgl.NavigationControl());

    // Event listener for clicking on the map
    map.on('click', function (e) {
        // Remove existing marker
        if (marker) {
            marker.remove();
        }

        // Add a new marker at the clicked location
        marker = new mapboxgl.Marker()
            .setLngLat(e.lngLat)
            .addTo(map);

        // Get the coordinates of the selected location
        const selectedCoords = [e.lngLat.lat, e.lngLat.lng];

        // Call the function to fetch weather details based on the selected coordinates
        getWeatherByCoords(selectedCoords);
    });
}

// Function to get weather details based on coordinates
function getWeatherByCoords(coords) {
    const apiKey = 'aa4a87fb43096eac5604114eb772f71e';
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${coords[0]}&lon=${coords[1]}&appid=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            displayWeather(data);
            scrollToWeatherTable();
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert('Error fetching weather data. Please try again.');
        });
}

// Function to handle location input
function handleLocationInput() {
    const locationInput = document.getElementById('locationInput').value;
    
    // Check if the input is not empty
    if (locationInput.trim() !== '') {
        // Use the Mapbox Geocoding API to get the coordinates for the input location
        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${locationInput}.json?access_token=${mapboxgl.accessToken}`)
            .then(response => response.json())
            .then(data => {
                if (data.features && data.features.length > 0) {
                    const coordinates = data.features[0].geometry.coordinates;
                    getWeatherByCoords(coordinates);
                } else {
                    alert('Location not found. Please enter a valid location.');
                }
            })
            .catch(error => {
                console.error('Error fetching location data:', error);
                alert('Error fetching location data. Please try again.');
            });
    } else {
        alert('Please enter a location.');
    }
}

// Event listener for the search button
const searchButton = document.getElementById('searchButton');
searchButton.addEventListener('click', function() {
    handleLocationInput();
});

const locationInput = document.getElementById('locationInput');
locationInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        handleLocationInput();
    }
});

// Function to auto-scroll to the weather table
function scrollToWeatherTable() {
    const weatherTable = document.getElementById('weatherTable');
    weatherTable.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


// Function to display weather information
function displayWeather(data) {
    const weatherTable = document.getElementById('weatherTable');
    
    // Extract relevant information from the API response
    const cityName = data.city.name;
    const forecastList = data.list;
    
    // Create a heading for the city name
    const heading = document.createElement('h3');
    heading.textContent = `Weather Forecast for ${cityName}`;
    weatherTable.appendChild(heading);

    // Create a table
    const table = document.createElement('table');
    table.classList.add('weather-table');

    // Create table headers
    const headers = ['Date', 'Temperature (°C)', 'Weather'];
    const headerRow = document.createElement('tr');
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Populate the table with forecast data
    forecastList.forEach(forecast => {
        const timestamp = forecast.dt * 1000; // Convert to milliseconds
        const date = new Date(timestamp);
        const temperature = convertKelvinToCelsius(forecast.main.temp);
        const weatherDescription = forecast.weather[0].description;

        const row = document.createElement('tr');
        const dateCell = document.createElement('td');
        dateCell.textContent = date.toDateString();
        const tempCell = document.createElement('td');
        tempCell.textContent = `${temperature} °C` ;
        const weatherCell = document.createElement('td');
        weatherCell.textContent = weatherDescription;

        row.appendChild(dateCell);
        row.appendChild(tempCell);
        row.appendChild(weatherCell);

        table.appendChild(row);
    });

    // Clear previous content and append the table
    weatherTable.innerHTML = '';
    weatherTable.appendChild(table);
}

function convertKelvinToCelsius(kelvin) {
    return (kelvin - 273.15).toFixed(2);
}

// Call the initMap function when the window has loaded
window.onload = function () {
    initMap();
};
