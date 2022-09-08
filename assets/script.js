// ----- VARIABLES -----
var apiKey = "ab3a5573ca2d878ca5a062e1e21e12e8";
var oneCallApiKey = "9b35244b1b7b8578e6c231fd7654c186";

// query selectors
var cityInput = document.querySelector("#city");
var searchBtn = document.querySelector("#search-button");
var searchHistoryEl = document.querySelector("#search-history");
var errorMessageEl = document.querySelector("#error-message");
var currentForecastEl = document.querySelector("#current-forecast");
var futureForecastEl = document.querySelector("#future-forecast");

// variables for future use
var currentCity;
var latitude;
var longitude;
var searchHistoryArray;



// ----- GEOLOCATION & SEARCH HISTORY FUNCTIONS -----

// get the city input from the form and pass it in the API call
function getCityInput(){
    if (cityInput.value !== ""){
        console.log(cityInput.value);
        searchForCity(cityInput.value);
    }
}

// when the user wants to search for a city, run this function to get the API call
function searchForCity(city){
    currentCity = city;
    var geolocationUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=" + apiKey;

    fetch(geolocationUrl, {
        method: "GET"
    })
    .then(function(response){
        return response.json();
    }).then(function(data){
        var cityData = data[0];
        // console.log(cityData);

        latitude = cityData.lat;
        longitude = cityData.lon;

        if (cityData.length === 0){
            errorMessageEl.textContent = "That city doesn't exist. Please input another one!";
        } else if (searchHistoryArray.includes(currentCity) === false){
            updateSearchHistory(cityData.name);
        }

        // if the API call returned something, get both current weather data and future forecast data
        if (cityData.length !== 0){
            getCurrentWeatherData();
            getForecastWeatherData();
        } 
    })
}

// adds the newest entry to searchHistoryArray; if there are more than 10 results, get rid of the oldest entry
function updateSearchHistory(city){
    errorMessageEl.textContent = "";
    searchHistoryArray.push(city);
    if (searchHistoryArray.length > 10){
        searchHistoryArray.splice(0, 1);
    }
    addToLocalStorage();
}

// if there is previous search history, get that data and store it in searchHistoryArray
// if there is no search history, make searchHistoryArray an empty array
function getSearchHistoryFromLocalStorage(){
    searchHistoryArray = JSON.parse(localStorage.getItem("cities"));
    if (searchHistoryArray === null){
        searchHistoryArray = [];
    }
    displaySearchHistory();
}

// whenever searchHistoryArray is updated, update localStorage
function addToLocalStorage(){
    localStorage.setItem("cities", JSON.stringify(searchHistoryArray));
    displaySearchHistory();
}

// display search history results
function displaySearchHistory(){
    searchHistoryEl.innerHTML = "";
    for (var i = searchHistoryArray.length-1; i > -1; i--){
        var historyBtn = document.createElement("button");
        historyBtn.setAttribute("class", "history-btn border-0 rounded w-100 bg-secondary text-white p-1 m-1");
        historyBtn.textContent = searchHistoryArray[i];
        searchHistoryEl.appendChild(historyBtn);
    }
}


// ----- CURRENT WEATHER DATA FUNCTIONS -----

//function to get the current weather information using latitude and longitude
function getCurrentWeatherData(){
    // console.log(latitude,longitude);
    var currentWeatherApiUrl = "https://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&appid=" + apiKey+ "&units=imperial";

    fetch(currentWeatherApiUrl, {
        method: "GET"
    })
    .then(function(response){
        return response.json();
    }).then(function(data){
        displayCurrentForecast(data);
    })
}

// function to display the information in currentForecastEl
function displayCurrentForecast(data){
    // heading of city, today's date, and icon of the current overcast
    currentForecastEl.innerHTML = "";
    var cityHeading = document.createElement("h2");
    cityHeading.setAttribute("style", "font-weight: bold;")
    cityHeading.textContent = currentCity + " (" + moment.unix(data.dt).format("M/D/YYYY") + ")" 
    var iconImg = document.createElement("img");
    iconImg.setAttribute("src", ("https://openweathermap.org/img/w/"+ data.weather[0].icon + ".png"));
    cityHeading.appendChild(iconImg);

    // temperature, wind, humidity
    var currentTemp = document.createElement("p");
    var currentWind = document.createElement("p");
    var currentHumidity = document.createElement("p");

    currentTemp.textContent = "Temp: " + data.main.temp + "°F";
    currentWind.textContent = "Wind: " + data.wind.speed + " MPH";
    currentHumidity.textContent = "Humidity: " + data.main.humidity + "%";

    // UV Index API
    var currentUvIndex = document.createElement("p");
    var uvIndexUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&appid=" + oneCallApiKey;

    fetch(uvIndexUrl, {
        method: "GET",
    }).then(function(response){
        return response.json();
    }).then(function(data){
        // console.log(data.current.uvi);
        currentUvIndex.innerHTML = "UV Index: <span class='uv-index text-white px-2 rounded'>" + data.current.uvi + "<span>";
        var spanEl = document.querySelector(".uv-index");
        spanEl.setAttribute("style", "background-color: "+getUVIndexColor(data.current.uvi));
    });

    // add everything to the container
    currentForecastEl.appendChild(cityHeading);
    currentForecastEl.appendChild(currentTemp);
    currentForecastEl.appendChild(currentWind);
    currentForecastEl.appendChild(currentHumidity);
    currentForecastEl.appendChild(currentUvIndex);
}

// gets the color of the UV Index based off of https://www.openuv.io/uvindex
function getUVIndexColor(uvIndex){
    if (uvIndex >=0 && uvIndex < 3){
        return "#558B2F";
    } else if (uvIndex >= 3 && uvIndex < 6){
        return "#F9A825";
    } else if (uvIndex >= 6 && uvIndex < 8){
        return "#EF6C00";
    } else if (uvIndex >= 8 && uvIndex < 11){
        return "#B71C1C";
    } else if (uvIndex >= 11){
        return "#6A1B9A";
    }
}



// ----- FUTURE FORECAST WEATHER DATA FUNCTIONS -----

// function to get future forecast using latitude and longitude
function getForecastWeatherData(){
    var forecastUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&appid=" + oneCallApiKey +"&exclude=current,hourly,minutely,alerts&units=imperial";

    fetch(forecastUrl, {
        method: "GET",
    }).then(function(response){
        return response.json();
    }).then(function(data){
        displayFutureForecast(data);
    })
}

// display next 5 days' forecast for currentCity in cards
function displayFutureForecast(data){
    futureForecastEl.innerHTML = "";
    for (var i = 0; i < 5; i++){
        var nextDay = data.daily[i];

        // create the card
        var forecastCard = document.createElement("div");
        forecastCard.setAttribute("class", "forecast-card col m-1 py-2");

        // the next day's date
        var nextDayHeading = document.createElement("h4");
        nextDayHeading.textContent = moment.unix(nextDay.dt).format("M/D/YYYY");
        forecastCard.appendChild(nextDayHeading);

        // icons
        var nextDayIcon = document.createElement("img");
        nextDayIcon.setAttribute("src", ("https://openweathermap.org/img/w/"+ nextDay.weather[0].icon + ".png"))
        forecastCard.appendChild(nextDayIcon);

        // temperature, wind speed, humidity
        var nextDayTemp = document.createElement("p");
        var nextDayWind = document.createElement("p");
        var nextDayHumidity = document.createElement("p");

        nextDayTemp.textContent = "Temp: " + nextDay.temp.day + "°F";
        nextDayWind.textContent = "Wind: " + nextDay.wind_speed + " MPH";
        nextDayHumidity.textContent = "Humidity: " + nextDay.humidity + "%";

        forecastCard.appendChild(nextDayTemp);
        forecastCard.appendChild(nextDayWind);
        forecastCard.appendChild(nextDayHumidity);

        futureForecastEl.appendChild(forecastCard);
    }
    
}



// ----- EVENT LISTENERS -----

// when the user clicks the "Search" button to search for the city inputted in the form
searchBtn.addEventListener("click", getCityInput);

// when the user clicks on a button from the search history, call the API again for this city
searchHistoryEl.addEventListener("click", function(event){
    var element = event.target;
    if (element.matches(".history-btn")){
        // console.log(element.textContent);
        // console.log("button has been pressed");
        searchForCity(element.textContent);
    }
})



// ----- PAGE LOAD -----
getSearchHistoryFromLocalStorage();
// if there is previous search history fill in the sections with the most recent entry
if (searchHistoryArray.length !== 0){
    searchForCity(searchHistoryArray[searchHistoryArray.length - 1]);
}
