import {months} from './config.js';

const WEATHERAPI = 'https://community-open-weather-map.p.rapidapi.com/find?type=link%252C%20accurate&units=metric&q=';
const apiKey = '4595799bc0msh11d455896e8fd3dp14fc0fjsn36b3a68776b4';

// const WEATHERAPI = 'api.openweathermap.org/data/2.5/weather?q=';
// const apiKey = '&appid=cba9b27e4c6cd316c764d468b4ee756e'

const CITIESAPI = "https://wft-geo-db.p.rapidapi.com/v1/geo/cities";
const cities = [];

const input = document.querySelector('[name="city"]')
const list = document.querySelector('.list')
const city = document.querySelector('.result-section')
const reload = document.querySelector('.reload')

const day = document.querySelector('.date')

async function searchCity() {
	const today = new Date();
	day.textContent = `${months[today.getMonth()]} ${today.getDate()}`

	input.focus();
	const res = await fetch(`${CITIESAPI}`, {
							"method": "GET",
							"headers": {
								"x-rapidapi-host": "wft-geo-db.p.rapidapi.com",
								"x-rapidapi-key": "4595799bc0msh11d455896e8fd3dp14fc0fjsn36b3a68776b4"
								}
							})
	const data = await res.json();
	cities.push(...data) 
}

function findMatch(wordToMatch) {
	return cities.filter(place => {
		const regex = new RegExp(wordToMatch, 'gi');
		return place.city.match(regex);
	})
}


async function getCityWeather(query) {
	// console.log(`${WEATHERAPI}${query}${apiKey}&units=metric`)
	// const res = await fetch(`${WEATHERAPI}${query}${apiKey}`)
	const res = await fetch(`${WEATHERAPI}${query}`,{"method": "GET",
							"headers": {
								"x-rapidapi-host": "community-open-weather-map.p.rapidapi.com",
								"x-rapidapi-key": `${apiKey}`
							}
						})
	console.log(res)
	const {list} = await res.json();
	console.log(list[0])
	city.innerHTML = displayCityWeather(list[0]);
}

function displayList() {
	const matchArray = findMatch(this.value);
	const html = matchArray.map(city => {
		return `
			<li>${city.city}, ${city.state}</li>
		`
	}).join("");
	list.innerHTML = html;
}

function displayCityWeather(city) {
	return `
		<div class="city">
			<h3>${city.name}, ${city.sys.country}</h3>
			<p class="temperature">${city.main.temp} 
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