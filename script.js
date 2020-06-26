import {months} from './config.js';
// import cities from 'cities.json';
// console.log(cities)

const WEATHERAPI = 'https://community-open-weather-map.p.rapidapi.com/find?type=link%252C%20accurate&units=metric&q=';
const apiKey = '4595799bc0msh11d455896e8fd3dp14fc0fjsn36b3a68776b4';

// const WEATHERAPI = 'api.openweathermap.org/data/2.5/weather?q=';
// const apiKey = '&appid=cba9b27e4c6cd316c764d468b4ee756e'

//const CITIESAPI = 'https://gist.githubusercontent.com/Miserlou/c5cd8364bf9b2420bb29/raw/2bf258763cdddd704f8ffd3ea9a3e81d25e2c6f6/cities.json';
const CITIESAPI = 'https://raw.githubusercontent.com/lutangar/cities.json/master/cities.json'
const citiesArr = [];

const input = document.querySelector('[name="city"]')
const list = document.querySelector('.list')
const city = document.querySelector('.result-section')
const reload = document.querySelector('.reload')

const day = document.querySelector('.date')

async function searchCity() {
	const date = new Date();
	const today = `${months[date.getMonth()]} ${date.getDate()}`
	day.textContent = today;

	input.focus();
	input.parentElement.reset();
	
	const res = await fetch(`${CITIESAPI}`);
	const data = await res.json();
	citiesArr.push(...data) 
}

function findMatch(wordToMatch) {
	return citiesArr.filter(place => {
		const regex = new RegExp(wordToMatch, 'gi');
		return place.name.match(regex);
	})
}


async function getCityWeather(query) {
	const res = await fetch(`${WEATHERAPI}${query}`,{"method": "GET",
							"headers": {
								"x-rapidapi-host": "community-open-weather-map.p.rapidapi.com",
								"x-rapidapi-key": `${apiKey}`
							}
						})
	
	const {list} = await res.json();
	console.log(list[0])
	city.innerHTML = displayCityWeather(list[0]);
	input.parentElement.reset();
}

function displayList() {
	const matchArray = findMatch(this.value);
	const html = matchArray.map(city => {
		return `
			<li class="city">${city.name}, ${city.country}</li>
		`
	}).join("");
	list.innerHTML = html;
}

function displayCityWeather(city) {
	return `
		<div class="city">
			<h3>${city.name}, ${city.sys.country}</h3>
			<p class="temperature">${Math.round(city.main.temp)} 
				<i class="fas fa-temperature-high icon-temp"></i> 
				<img src="http://openweathermap.org/img/wn/${city.weather[0].icon}@2x.png" alt="weather" />
			</p>
			<div class="description">
				${city.weather[0].icon.includes('n') ? '<p>Night</p>' : ""}
				<p>${city.weather[0].description}</p>
			</div>
			<div class="details">
				<span>
					<p>wind</p> 
					${city.wind.speed} m/s
				</span>
				<span>
					<p>humidity</p>
					${city.main.humidity} %
				</span>
			</div>
		</div>
	`
}

function chooseCity(e) {
	const city = e.target.textContent.split(",")
	if (!e.target.classList.contains('city')) { 
		console.log('got you')
		return 
	}
	
	getCityWeather(city)
	list.remove();
}

 function reloadPage(e) {
	e.preventDefault();
	window.location.reload()
	this.parentElement.reset()
}

input.addEventListener('keyup', displayList)
input.addEventListener('change', displayList)
reload.addEventListener('click', reloadPage)


list.addEventListener('click', chooseCity);
searchCity();