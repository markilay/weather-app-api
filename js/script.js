import { months, sidebarCities } from "./config.js";

const WEATHER_API = "https://api.openweathermap.org/data/2.5/";
const API_KEY = "cba9b27e4c6cd316c764d468b4ee756e";

const LOCATION_API =
  "https://api.bigdatacloud.net/data/reverse-geocode-client?";

const WINDOW_WIDTH = 600;

const input = document.querySelector('[name="city"]');
const city = document.querySelector(".result-section");
const reload = document.querySelector(".reload");
const form = document.querySelector(".form");
const date = document.querySelector(".date");
const sidebar = document.querySelector(".sidebar");
const sidebarBtn = document.querySelector(".sidebar-btn");
const backdrop = document.querySelector(".backdrop");

async function getCityWeather(query) {
  const res = await fetch(
    `${WEATHER_API}weather?q=${query}&appid=${API_KEY}&units=metric`
  );
  const data = await res.json();

  city.innerHTML = displayCityWeather(data);
  form.reset();
}

function showDate() {
  const now = new Date();
  const day = now.getDate();
  const month = months[now.getMonth()];
  date.textContent = `${String(day).padStart(2, "0")} ${month}`;
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

function generateWeather(city, img, id) {
  const { img: weatherImg, isNight } = useImg(city.weather[0].icon);

  return `
    <a href='https://www.bbc.com/weather/${id}' target='_blank'>
      <div class="popular-city" data-id=${id}>
        <div class="city-img"> 
          <img
            src="${img}"
            alt="weather"
          />
        </div>
        <div class="info">
          <div class="title">
            <h3>${city.name}, ${city.sys.country}</h3>
            <p class="temperature">
              ${Math.floor(city.main.temp)}
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
              <p>wind ${city.wind.speed} m/s</p> 
              <p>humidity ${city.main.humidity} %</p>
          </div>
        </div>
      </div>
    </a>
  `;
}

async function generatePopularCities() {
  const html = await Promise.all(
    sidebarCities.map(async ({ city, img, id }) => {
      const res = await fetch(
        `${WEATHER_API}weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      return generateWeather(data, img, id);
    })
  );

  sidebar.innerHTML = html.join("");
}

function handlerSidebar(e) {
  if (!sidebar.classList.contains("open")) {
    generatePopularCities();
    backdrop.classList.add("open");

    if (window.innerWidth <= WINDOW_WIDTH) {
      const loader = document.querySelector(".loader");

      loader.style.display = "block";
      setTimeout(() => {
        loader.style.display = "none";
        sidebar.classList.add("open");
      }, 1000);
    } else {
      sidebar.classList.add("open");
    }
  } else {
    sidebar.classList.remove("open");
    backdrop.classList.remove("open");
  }
}

function closeSideBar(e) {
  if (
    (e.key === "Escape" && sidebar.classList.contains("open")) ||
    e.target.classList.contains("backdrop")
  ) {
    sidebar.classList.remove("open");
    backdrop.classList.remove("open");
  }
}

reload.addEventListener("click", reloadPage);
form.addEventListener("submit", submitSearch);
sidebarBtn.addEventListener("click", handlerSidebar);
window.addEventListener("keyup", closeSideBar);
window.addEventListener("click", closeSideBar);
window.addEventListener("load", () => input.focus());

navigator.geolocation.getCurrentPosition(
  (data) => {
    showPosition(data);
  },
  (err) => {
    console.error(err);
    alert("Type a city you want to find");
  }
);

showDate();
