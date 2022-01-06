'use strict';

import { fromUnixTime } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

// console.log(fromUnixTime(1641362400 + tz).toUTCString());
// console.log(fromUnixTime(1641362400 + tz));

const cityInput = document.querySelector('#city');
const submit = document.querySelector('#submit');
const errorMessage = document.querySelector('#error-message');
const cityName = document.querySelector('#city-name');
const dateDisplay = document.querySelector('#date');
const timeDisplay = document.querySelector('#time');
const weatherDescription = document.querySelector('#weather-description');
const weatherIcon = document.querySelector('#weather-icon');
const currentTemp = document.querySelector('#current-temp');
const high = document.querySelector('#high');
const low = document.querySelector('#low');
const feelsLike = document.querySelector('#feels-like');
const wind = document.querySelector('#wind');
const pop = document.querySelector('#pop');
const humidity = document.querySelector('#humidity');
const sunrise = document.querySelector('#sunrise');
const sunset = document.querySelector('#sunset');

class City {
  constructor(
    name,
    country,
    weather,
    weatherIcon,
    temp,
    high,
    low,
    feelsLike,
    wind,
    pop,
    humidity,
    sunrise,
    sunset,
    daily,
    hourly,
    timezone
  ) {
    this.name = name;
    this.country = country;
    this.weather = weather;
    this.weatherIcon = weatherIcon;
    this.temp = Math.round(temp);
    this.low = Math.round(low);
    this.high = Math.round(high);
    this.feelsLike = Math.round(feelsLike);
    this.wind = Math.round(wind * 3.6 * 10) / 10;
    this.pop = Math.round(pop * 100);
    this.humidity = humidity;
    this.sunrise = formatTime(getCityDateTime(sunrise, timezone));
    this.sunset = formatTime(getCityDateTime(sunset, timezone));
    this.daily = daily;
    this.hourly = hourly;
    this.timezone = timezone;
  }
}

const getCityDateTime = (unixTime, timeZone) => {
  const dateTime = fromUnixTime(unixTime);
  const date = new Date(
    formatInTimeZone(dateTime, timeZone, 'yyyy'),
    formatInTimeZone(dateTime, timeZone, 'MM') - 1,
    formatInTimeZone(dateTime, timeZone, 'dd'),
    formatInTimeZone(dateTime, timeZone, 'HH'),
    formatInTimeZone(dateTime, timeZone, 'mm')
  );
  console.log(date);
  return date;
};

const formatDate = (date) => {
  const month = date.toLocaleDateString('default', { month: 'long' });
  const monthDay = date.getDate();
  const day = date.toLocaleString('en-us', { weekday: 'long' });
  const year = date.getFullYear();
  return `${day}, ${month} ${monthDay}, ${year}`;
};

const formatTime = (dateObj) => {
  const amOrFm = `${dateObj.getHours() >= 12 ? 'PM' : 'AM'}`;
  let hour = dateObj.getHours();
  let minutes = dateObj.getMinutes();

  // convert hour to 12 hour format
  if (hour > 12) {
    hour -= 12;
  }

  // add a 0 in front of minutes less than 10
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }
  return `${hour}:${minutes} ${amOrFm}`;
};

const capitalizeWords = (str) => {
  const capitalizedWord = str
    .split(' ')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
  return capitalizedWord;
};

const getUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      getCityDataByCurrentLocation(
        position.coords.latitude,
        position.coords.longitude
      );
    });
  }
};

const getCityDataByName = async (cityName) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=825c62a98c0ddf6dc90d3b25d56c1adb`,
      { mode: 'cors' }
    );
    const data = await response.json();
    return getCityWeather(
      data.name,
      data.sys.country,
      data.coord.lat,
      data.coord.lon
    );
  } catch (err) {
    console.log(err);
  }
};

const getCityDataByCurrentLocation = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=825c62a98c0ddf6dc90d3b25d56c1adb`,
      { mode: 'cors' }
    );
    const data = await response.json();
    return getCityWeather(
      data.name,
      data.sys.country,
      data.coord.lat,
      data.coord.lon
    );
  } catch (err) {
    console.log(err);
  }
};

const getCityData = async (cityName) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=825c62a98c0ddf6dc90d3b25d56c1adb`,
      { mode: 'cors' }
    );
    const data = await response.json();

    errorMessage.textContent = '';
    cityInput.value = '';
    cityInput.style.border = 'none';
    return getCityWeather(
      data.name,
      data.sys.country,
      data.coord.lat,
      data.coord.lon
    );
  } catch (err) {
    cityInput.style.border = '1px solid red';
    errorMessage.innerHTML = `
      Location cannot be found<br>
      Format search to be "City", or "City, State"
    `;
  }
};

const getCityWeather = async (cityName, country, lat, lon) => {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=825c62a98c0ddf6dc90d3b25d56c1adb`,
    { mode: 'cors' }
  );
  const responseData = await response.json();
  timeDisplay.textContent = formatTime(
    getCityDateTime(responseData.current.dt, responseData.timezone)
  );
  dateDisplay.textContent = formatDate(
    getCityDateTime(responseData.current.dt, responseData.timezone)
  );
  const weatherData = await Promise.all([
    responseData.current.weather[0].description,
    responseData.current.weather[0].icon,
    responseData.current.temp,
    responseData.daily[0].temp.min,
    responseData.daily[0].temp.max,
    responseData.current.feels_like,
    responseData.current.wind_speed,
    responseData.daily[0].pop,
    responseData.current.humidity,
    responseData.current.sunrise,
    responseData.current.sunset,
    responseData.daily,
    responseData.hourly,
    responseData.timezone,
  ]);
  document.querySelector('#loader-container').style.display = 'none';
  const city = new City(cityName, country, ...weatherData);
  updateCurrentWeather(city);
  updateDailyForecast(city);
  updateHourlyForecast(city);
};

submit.addEventListener('click', async (e) => {
  e.preventDefault();
  if (cityInput.value == '') {
    errorMessage.innerHTML = 'Please enter a city';
    cityInput.style.border = '1px solid red';
  } else {
    await getCityDataByName(cityInput.value);
    errorMessage.textContent = '';
    cityInput.value = '';
    cityInput.style.border = 'none';
  }
});

cityInput.addEventListener('keypress', async (e) => {
  if (e.key == 'Enter') {
    if (cityInput.value == '') {
      errorMessage.innerHTML = 'Please enter a city';
      cityInput.style.border = '1px solid red';
    } else {
      await getCityDataByName(cityInput.value);
      errorMessage.textContent = '';
      cityInput.value = '';
      cityInput.style.border = 'none';
    }
  }
});

const updateCurrentWeather = (city) => {
  cityName.textContent = `${capitalizeWords(city.name)}, ${city.country}`;
  weatherDescription.textContent = capitalizeWords(city.weather);
  weatherIcon.src = `http://openweathermap.org/img/wn/${city.weatherIcon}@2x.png`;
  currentTemp.textContent = `${city.temp}°C`;
  high.textContent = `${city.high}°C`;
  low.textContent = `${city.low}°C`;
  feelsLike.textContent = `${city.feelsLike}°C`;
  wind.textContent = `${city.wind} km/h`;
  pop.textContent = `${city.pop}%`;
  humidity.textContent = `${city.humidity}%`;
  sunrise.textContent = city.sunrise;
  sunset.textContent = city.sunset;
};

const createForecast = (
  dayOrTime,
  weatherIcon,
  weatherDescription,
  pop,
  wind,
  temp
) => {
  const forecastRow = document.createElement('li');
  forecastRow.classList.add('forecast-row');
  forecastRow.innerHTML = `
    <p>${dayOrTime}</p>
    <div class="forecast-weather">
      <img src="http://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt="" />
      <span>${weatherDescription}</span>
    </div>
    <p>${pop}%</p>
    <p>${wind}km/h</p>
    <div>
      ${
        temp.length > 1
          ? `<p class="degree">${temp[0]}°C</p><p class="degree">${temp[1]}°C</p>`
          : `<p class="degree">${temp}°C</p>`
      }
    </div>
    
  `;
  return forecastRow;
};

const updateDailyForecast = (city) => {
  const dailyForecast = city.daily;
  const dailyContainer = document.querySelector('#daily-container ul');
  clearForecastContainer(dailyContainer);
  for (let i = 1; i < dailyForecast.length; i++) {
    // go to 1 to skip current day
    const day = dailyForecast[i];
    const dateTime = fromUnixTime(day.dt);
    const dayString = dateTime
      .toLocaleString('en-us', { weekday: 'short' })
      .toUpperCase();
    const weatherIcon = day.weather[0].icon;
    const weatherDescription = capitalizeWords(day.weather[0].description);
    const pop = Math.round(day.pop * 100);
    const wind = Math.round(day.wind_speed * 3.6 * 10) / 10;
    const high = Math.round(day.temp.max);
    const low = Math.round(day.temp.min);
    const temp = [high, low];
    const forecastRow = createForecast(
      dayString,
      weatherIcon,
      weatherDescription,
      pop,
      wind,
      temp
    );
    dailyContainer.appendChild(forecastRow);
  }
};

const updateHourlyForecast = (city) => {
  const hourlyForecast = city.hourly;
  const hourlyContainer = document.querySelector('#hourly-container ul');
  clearForecastContainer(hourlyContainer);
  for (let i = 1; i < 9; i++) {
    const hour = hourlyForecast[i];
    const hourConverted = formatTime(getCityDateTime(hour.dt, city.timezone));
    const weatherIcon = hour.weather[0].icon;
    const weatherDescription = capitalizeWords(hour.weather[0].description);
    const pop = Math.round(hour.pop * 100);
    const wind = Math.round(hour.wind_speed * 3.6 * 10) / 10;
    const temp = Math.round(hour.temp);
    const forecastRow = createForecast(
      hourConverted,
      weatherIcon,
      weatherDescription,
      pop,
      wind,
      temp
    );
    hourlyContainer.appendChild(forecastRow);
  }
};

const clearForecastContainer = (container) => {
  const clearForecastList = (container) => {
    while (!container.lastElementChild.classList.contains('forecast-header')) {
      container.removeChild(container.lastElementChild);
    }
  };
  clearForecastList(container);
};

document.querySelector('#forecast-choice').addEventListener('click', (e) => {
  if (
    e.target.getAttribute('id') == 'daily' ||
    e.target.getAttribute('id') == 'hourly'
  ) {
    const activeChoice = document.querySelector('.active-forecast-choice');
    activeChoice.classList.remove('active-forecast-choice');
    e.target.classList.add('active-forecast-choice');
  }
});

document.querySelector('#daily').addEventListener('click', () => {
  const dailyContainer = document.querySelector('#daily-container');
  const hourlyContainer = document.querySelector('#hourly-container');
  dailyContainer.style.display = 'grid';
  hourlyContainer.style.display = 'none';
});

document.querySelector('#hourly').addEventListener('click', () => {
  const dailyContainer = document.querySelector('#daily-container');
  const hourlyContainer = document.querySelector('#hourly-container');
  hourlyContainer.style.display = 'grid';
  dailyContainer.style.display = 'none';
});

// dateDisplay.textContent = displayCurrentDate();

getUserLocation();

document
  .querySelector('#degree-toggle-check')
  .addEventListener('change', (e) => {
    if (e.target.checked == true) {
      document.querySelectorAll('.degree').forEach((ele) => {
        const temp = ele.textContent.replace(/[^\d-]/g, '');
        ele.textContent = `${Math.round(temp * (9 / 5) + 32)}°F`;
      });
    } else {
      document.querySelectorAll('.degree').forEach((ele) => {
        const temp = ele.textContent.replace(/[^\d-]/g, '');
        ele.textContent = `${Math.round((temp - 32) * (5 / 9))}°C`;
      });
    }
  });
