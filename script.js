const weatherEndpoint = 'https://community-open-weather-map.p.rapidapi.com/find?type=link%252C%20accurate&units=imperial%252C%20metric&q=';
const apiKey = '4595799bc0msh11d455896e8fd3dp14fc0fjsn36b3a68776b4';

const citiesEndpoint = 'https://gist.githubusercontent.com/Miserlou/c5cd8364bf9b2420bb29/raw/2bf258763cdddd704f8ffd3ea9a3e81d25e2c6f6/cities.json';
const cities = [];

const input = document.querySelector('[name="city"]')
const list = document.querySelector('.list')
const city = document.querySelector('.result-section')
const reload = document.querySelector('.reload')

async function searchCity() {
	const res = await fetch(`${citiesEndpoint}`);
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
	const res = await fetch(`${weatherEndpoint}${query}`, {
							"method": "GET",
							"headers": {
								"x-rapidapi-host": "community-open-weather-map.p.rapidapi.com",
								"x-rapidapi-key": `${apiKey}`
							}
						})
	const {list} = await res.json();
	console.log(list[0])
	city.innerHTML = await displayCityWeather(list[0]);
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
			<div class="description">
				<p>current weather: ${city.weather[0].main} </p>
				<p>details: ${city.weather[0].description}</p>
			</div>
			<div class="details">
					<span>
						<p>temperature</p>
						${city.main.temp} <i class="fas fa-temperature-high"></i> 
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