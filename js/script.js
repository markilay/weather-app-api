import { months, sidebarCities } from "./config.js";

const WEATHER_API = "https://api.openweathermap.org/data/2.5/";
const API_KEY = "cba9b27e4c6cd316c764d468b4ee756e";

const CITIES_API =
  "https://gist.githubusercontent.com/Miserlou/c5cd8364bf9b2420bb29/raw/2bf258763cdddd704f8ffd3ea9a3e81d25e2c6f6/cities.json";

const LOCATION_API =
  "https://api.bigdatacloud.net/data/reverse-geocode-client?";

const input = document.querySelector('[name="city"]');
const list = document.querySelector(".list");
const city = document.querySelector(".result-section");
const reload = document.querySelector(".reload");
const form = document.querySelector(".form");
const day = document.querySelector(".date");
const sidebar = document.querySelector(".sidebar");
const sidebarBtn = document.querySelector(".sidebar-btn");
const cities = [];

async function getCityWeather(query) {
  const res = await fetch(
    `${WEATHER_API}weather?q=${query}&appid=${API_KEY}&units=metric`
  );
  const data = await res.json();

  city.innerHTML = displayCityWeather(data);
  form.reset();
}

function useImg(icon) {
  const img = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  const isNight = icon.includes("n");

  return { img, isNight };
}

function displayCityWeather(city) {
  const { img, isNight } = useImg(city.weather[0].icon);

  return `
    <div class="city">
      <h3>${city.name}, ${city.sys.country}</h3>
      <p class="temperature">${Math.floor(city.main.temp)} 
        <i class="fas fa-temperature-high icon-temp"></i> 
        <img src="${img}" alt="weather" />
      </p>
      <div class="description">
        ${isNight ? "<p>Night</p>" : ""}
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
  `;
}

function removeCityCard() {
  if (document.querySelector(".city")) {
    document.querySelector(".city").remove();
  }
}

function reloadPage(e) {
  e.preventDefault();
  list.textContent = "";
  removeCityCard();
  form.reset();
}

async function showPosition(position) {
  const latitude = `latitude=${position.coords.latitude}`;
  const longitude = `&longitude=${position.coords.longitude}`;
  const query = latitude + longitude + "&localityLanguage=en";

  const res = await fetch(`${LOCATION_API}${query}`);
  const { localityInfo } = await res.json();
  input.value = localityInfo.administrative[3].name;
}

function submitSearch(e) {
  e.preventDefault();
  getCityWeather(input.value);
}

reload.addEventListener("click", reloadPage);
form.addEventListener("submit", submitSearch);

async function openSidebar() {
  sidebar.classList.toggle("open");
  if (sidebar.classList.contains("open")) {
    const html = await Promise.all(
      sidebarCities.map(async ({ city, img }) => {
        const res = await fetch(
          `${WEATHER_API}weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        const data = await res.json();
        return generateWeather(data, img);
      })
    );
    sidebar.innerHTML = html.join("");
  }
}

function generateWeather(city, img) {
  const { img: weatherImg, isNight } = useImg(city.weather[0].icon);

  return `
    <div class="popular-city">
      <img
        class="city-img"
        src="${img}"
        alt="weather"
      />
      <div class="info">
        <div class="title">
          <h3>${city.name}, ${city.sys.country}</h3>
          <p class="temperature">
            ${Math.round(city.main.temp)}
            <i class="fas fa-temperature-high icon-temp"></i>
          </p>
        </div>
        <div class="description">
          ${isNight ? "<p>Night</p>" : ""}
          <p>${city.weather[0].description}</p>
        </div>
        <img
          src="${weatherImg}"
          alt="weather"
        />
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
    </div>
  `;
}

sidebarBtn.addEventListener("click", openSidebar);

navigator.geolocation.getCurrentPosition(
  (data) => {
    showPosition(data);
  },
  (err) => {
    console.error(err);
    alert("Type a city you want to find");
  }
);
