// https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}
// API key = ab3a5573ca2d878ca5a062e1e21e12e8

// geolocation API
// http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}

var apiKey = "ab3a5573ca2d878ca5a062e1e21e12e8";

var cityInput = document.querySelector("#city");
var searchBtn = document.querySelector("#search-button");
var searchHistoryEl = document.querySelector("#search-history");
var errorMessageEl = document.querySelector("#error-message");
// var historyButtons = document.querySelector('.history-btn');

var cityData;
var searchHistoryArray;

function getCityInput(){
    if (cityInput.value !== ""){
        console.log(cityInput.value);
        searchForCity(cityInput.value);
    }
}


// when the user wants to search for a city, run this function to get the API call
function searchForCity(city){
    // if the user has inputted a city in the input, run the API request; else, don't do anything
    var geolocationUrl = "http://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=" + apiKey;

    fetch(geolocationUrl, {
        method: "GET"
    })
    .then(function(response){
        return response.json();
    }).then(function(data){
        cityData = data;
        console.log(cityData);
        if (cityData.length !== 0){
            updateSearchHistory(city);
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
// if there is none, create searchHistoryArray as an empty array
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

// when the user clicks the "Search" button to search for the city inputted in the form
searchBtn.addEventListener("click", getCityInput);
searchHistoryEl.addEventListener("click", function(event){
    var element = event.target;
    if (element.matches(".history-btn")){
        console.log(element.textContent);
        // console.log("button has been pressed");
        searchForCity(element.textContent);
    }
})

// initial call upon page load
getSearchHistoryFromLocalStorage();