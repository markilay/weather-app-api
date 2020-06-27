import {months} from './config.js';

const WEATHER_API = 'http://api.openweathermap.org/data/2.5/weather?q=';
const apiKey = '&appid=cba9b27e4c6cd316c764d468b4ee756e'

const CITIES_API = 'https://raw.githubusercontent.com/lutangar/cities.json/master/cities.json'
const cities = [];

const LOCATION_API = "https://api.bigdatacloud.net/data/reverse-geocode-client?";

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
	
	const res = await fetch(`${CITIES_API}`);
	const data = await res.json();
	cities.push(...data) 
}

function findMatch(wordToMatch) {
	return cities.filter(place => {
		const regex = new RegExp(wordToMatch, 'gi');
		return place.name.match(regex);
	})
}

async function getCityWeather(query) {
	const res = await fetch(`${WEATHER_API}${query}${apiKey}&units=metric`)
	const data = await res.json();
	console.log(data)

	city.innerHTML = displayCityWeather(data);
	input.parentElement.reset();
}


function displayList() {

	if ( list.classList.contains('hidden')) {
		list.classList.remove('hidden')
	}
	removeCityCard()

	const matchArray = findMatch(input.value);
	const html = matchArray.map(city => {
		return `
			<li tabindex="0" class="place">${city.name}, ${city.country}</li>
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

function removeCityCard() {
	if (document.querySelector('.city')){
		document.querySelector('.city').remove()
	}
}

 function reloadPage(e) {
	e.preventDefault();
	list.textContent = '';
	removeCityCard()
	this.parentElement.reset()
}

async function showPosition(position) {
	const latitude = `latitude=${position.coords.latitude}`;
	const longitude = `&longitude=${position.coords.longitude}`
	const query = latitude + longitude + "&localityLanguage=en";

	const res = await fetch(`${LOCATION_API}${query}`);
	console.log(res)
	const {localityInfo} = await res.json();
	input.value = localityInfo.administrative[3].name;
	
	displayList()
}


input.addEventListener('keyup', displayList)
input.addEventListener('change', displayList)
reload.addEventListener('click', reloadPage)

list.addEventListener('click', function (e) {
	const city = e.target.textContent.split(",")
	if (!e.target.classList.contains('place')) { 
		console.log('got you')
		return 
	}
	
	getCityWeather(city)
	list.classList.add('hidden')
})

window.addEventListener('keyup', (e) => {
	const item = e.target.tagName;
	const city = e.target.textContent.split(",")

	if (e.target === list.firstElementChild && e.key === 'ArrowUp') {
		list.lastElementChild.focus()
	} else if (e.target === list.lastElementChild && e.key === 'ArrowDown') {
		list.firstElementChild.focus()
	} else if (e.key === 'ArrowDown' && item === 'LI'){
		e.target.nextElementSibling.focus()
	} else if (e.key === 'ArrowUp' && item === 'LI'){
		e.target.previousElementSibling.focus()
	} else if (e.key === 'Enter' && item === 'LI') {
		getCityWeather(city)
		list.classList.add('hidden')
	}
	
})

navigator.geolocation.getCurrentPosition(function (data) {
	showPosition(data)
}, (err) => {
	console.log(err)
	alert("Type a city you want to find")
}); 

searchCity();


