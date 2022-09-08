// https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}
// API key = ab3a5573ca2d878ca5a062e1e21e12e8

// geolocation API
// http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}

var apiKey = "ab3a5573ca2d878ca5a062e1e21e12e8";

var cityInput = document.querySelector("#city");
var searchBtn = document.querySelector("#search-button");
var searchHistoryEl = document.querySelector("#search-history");
var errorMessageEl = document.querySelector("#error-message");
var currentForecastEl = document.querySelector("#current-forecast");
var futureForecastEl = document.querySelector("#future-forecast");

var currentCity;
var latitude;
var longitude;
var searchHistoryArray;

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
    var geolocationUrl = "http://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=" + apiKey;

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

        if (cityData.length !== 0){
            updateSearchHistory(cityData.name);
            getCurrentWeatherData();
        } else{
            errorMessageEl.textContent = "That city doesn't exist. Please input another one!";
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
// if there is none, make searchHistoryArray an empty array
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

//display search history results
function displaySearchHistory(){
    searchHistoryEl.innerHTML = "";
    for (var i = searchHistoryArray.length-1; i > -1; i--){
        var historyBtn = document.createElement("button");
        historyBtn.setAttribute("class", "history-btn border-0 rounded w-100 bg-secondary text-white p-1 m-1");
        historyBtn.textContent = searchHistoryArray[i];
        searchHistoryEl.appendChild(historyBtn);
    }
}

//function to get the current weather information using latitude and longitude
function getCurrentWeatherData(){
    console.log(latitude,longitude);
    //temp main.temp, wind.speed, main.humidity, uv index
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
    currentForecastEl.innerHTML = "";
    var cityHeading = document.createElement("h2");
    cityHeading.setAttribute("style", "font-weight: bold;")
    cityHeading.textContent = currentCity + " (" + moment.unix(data.dt).format("M/D/YYYY") + ")" 
    var iconImg = document.createElement("img");
    iconImg.setAttribute("src", ("http://openweathermap.org/img/w/"+ data.weather[0].icon + ".png"));
    cityHeading.appendChild(iconImg);

    var currentTemp = document.createElement("p");
    var currentWind = document.createElement("p");
    var currentHumidity = document.createElement("p");

    currentTemp.textContent = "Temp: " + data.main.temp + "°F";
    currentWind.textContent = "Wind: " + data.wind.speed + " MPH";
    currentHumidity.textContent = "Humidity: " + data.main.humidity + "%";

    // TODO: UV index
    var currentUvIndex = document.createElement("p");
    var uvIndexUrl = "https://api.openuv.io/api/v1/uv?lat=" + latitude + "&lng=" + longitude;

    fetch(uvIndexUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "x-access-token": "912a40ef66e3595f4161207dcddd8ac3",
          },
    }).then(function(response){
        return response.json();
    }).then(function(data){
        currentUvIndex.innerHTML = "UV Index: <span class='uv-index text-white px-2 rounded'>" + data.result.uv + "<span>";
        var spanEl = document.querySelector(".uv-index");
        spanEl.setAttribute("style", "background-color: "+getUVIndexColor(data.result.uv));
    });

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













// EVENT LISTENERS
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


// PAGE LOAD
getSearchHistoryFromLocalStorage();