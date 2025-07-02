import {
  Schedule,
  RainPredictor,
  Location,
  haversineDistance,
} from "./rain_class.js";

let place = new Location("sample", 34, 32);
let plan = new Schedule("study", 0);

plan.view();

// current date for city rain time
const date = document.getElementById("date");
const day = document.getElementById("day");
const now = new Date();

const formattedDate = now.toLocaleDateString(undefined, {
  // year: "numeric",
  month: "long",
  day: "numeric",
});

const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const dayName = weekdays[now.getDay()];
date.textContent = formattedDate;
day.textContent = dayName;
const rain_form = document.getElementById("search-btn");
let store = document.getElementById("expect-rain");
const city_name_display=document.getElementById("city-name")
const wind_speed = document.getElementById("wind-speed");
const city_temp = document.getElementById("city-temp");

let rain = [];
const forecast_content= document.getElementById("forecast-content");

function get_weather(e) {
  e.preventDefault();
  const user_location = document.getElementById("search_input");
  const city_name = user_location.value.trim();
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city_name}&appid=9af8bc1b6986edcd1edf0598f4a26dd8&units=metric`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      let rain_status = {
        clouds_all: data.clouds.all,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        wind_speed: data.wind.speed,
        temp_max: data.main.temp_max,
        temp: data.main.temp,
      };
      const predictor = new RainPredictor();
      const p1 = predictor.update(rain_status);
      console.log(p1);
      console.log(predictor.getMedianETA());
      let time_to_rain = predictor.getMedianETA();
      rain.push(Number(time_to_rain));
      console.log(rain);
      store.innerHTML = `<h5 class="rain-expect-wrapper">expect rain in: ${time_to_rain} minutes</h5>
        <h5 class="rain-expect-wrapper">${data.weather[0].description}</h5>`;
      city_name_display.innerHTML = `${city_name}`;
      city_temp.innerHTML = `${rain_status.temp} <sup>o</sup>`;
      wind_speed.innerHTML=`${rain_status.wind_speed} km/h`
      console.log(rain_status);
      console.log(rain);
    })
    .catch((err) => {
      store.innerHTML = `<h5 class="rain-expect-wrapper">we couldn't find the  city, Make sure you are connected to the internet</h5>`;
      console.log(err);
    });
}

rain_form.addEventListener("click", get_weather);

const form_one = document.getElementById("first_form");
const form_two = document.getElementById("second_form");
const form_three = document.getElementById("third_form");
const form_four = document.getElementById("fourth_form");

const action_one = document.getElementById("action_one");
const time_one = document.getElementById("time_one");
const submit_one = document.getElementById("submit_one");

form_one.addEventListener("submit", (e) => {
  e.preventDefault();

  const action = action_one.value.trim();
  const time = time_one.value.trim();
  if (!action || !time) {
    alert("fill both fields");
    return;
  }

  plan.add(action, time);
  plan.view();
});

const action_two = document.getElementById("action_two");
const time_two = document.getElementById("time_two");
const submit_two = document.getElementById("submit_two");

form_two.addEventListener("submit", (e) => {
  e.preventDefault();
  const action = action_two.value.trim();
  const time = time_two.value.trim();
  if (!action || !time) {
    alert("fill both fields");
    return;
  }

  plan.add(action, time);
  plan.view();
});

const action_three = document.getElementById("action_three");
const time_three = document.getElementById("time_three");
const submit_three = document.getElementById("submit_three");

form_three.addEventListener("submit", (e) => {
  e.preventDefault();
  const action = action_three.value.trim();
  const time = time_three.value.trim();
  if (!action || !time) {
    alert("fill both fields");
    return;
  }

  plan.add(action, time);
  plan.view();
});

const action_four = document.getElementById("action_four");
const time_four = document.getElementById("time_four");
const submit_four = document.getElementById("submit_four");

form_four.addEventListener("submit", (e) => {
  e.preventDefault();
  const action = action_four.value.trim();
  const time = time_four.value.trim();
  if (!action || !time) {
    alert("fill both fields");
    return;
  }

  plan.add(action, time);
  plan.view();
});

const task_time = document.getElementById("task-time");
let schedule_time = [];

function sum_schedule_time(e) {
  e.preventDefault();
  let sum = 0;
  for (const value of plan.list_map.values()) {
    sum += Number(value);
  }
  schedule_time.push(Number(sum));
  console.log(schedule_time);
  if (Number(sum) == 0) {
    task_time.innerHTML = `<div>no task are added.please set your tasks</div> `;
    return;
  }
  task_time.innerHTML = `<div>${sum} minutes needed</div> `;
}

const complete_btn = document.getElementById("complete-btn");
complete_btn.addEventListener("click", sum_schedule_time);


// user current location
const output = document.getElementById("output");

function showPosition(pos) {
  const { latitude, longitude, accuracy } = pos.coords;
  output.textContent = `Lat: ${latitude}, Lng: ${longitude}`;
  place.add_place("home", latitude, longitude);
}

function handleError(err) {
  output.textContent = `we couldn't find your location, make sure you are connected to the internet`
  console.log("Error",err.code, err.message);

}

document.getElementById("btn-locate").addEventListener("click", () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(showPosition, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  } else {
    output.textContent = "Geolocation not supported by your browser.";
  }
});

// user destination location
const map = L.map("map").setView([0, 0], 2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap",
}).addTo(map);
let marker;
map.on("click", (e) => {
  const { lat, lng } = e.latlng;
  if (marker) marker.setLatLng(e.latlng);
  else marker = L.marker(e.latlng).addTo(map);
  console.log("Picked:", lat, lng);
  place.add_place("office", lat, lng);
});

$("#geoloc").leafletLocationPicker({
  inputBinding: {
    latitudeInput: $("#lat"),
    longitudeInput: $("#lng"),
    locationNameInput: $("#address"),
  },
  enableAutocomplete: true,
});

// distance and time b/n places calculater
const cal_distance = document.getElementById("cal_distance");
const distance_answer = document.getElementById("distance_answer");
let travel = [];

function calculate_distance(e) {
  e.preventDefault();
  let allKeys = Array.from(place.list_map.keys());
  if (allKeys.length < 2) {
    distance_answer.innerText = "please provide your locations and destination first.";
    return;
  }
  let lastTwoKeys = allKeys.slice(-2);
  let location_two_key = lastTwoKeys[0];
  let location_one_key = lastTwoKeys[1];
  console.log(location_one_key);
  console.log(location_two_key);
  let loco_one = place.list_map.get(location_one_key);
  let loco_two = place.list_map.get(location_two_key);
  let one_latitude = loco_one.latitude;
  let one_longitude = loco_one.longitude;
  let two_latitude = loco_two.latitude;
  let two_longitude = loco_two.longitude;
  let t_distance = haversineDistance(
    one_latitude,
    one_longitude,
    two_latitude,
    two_longitude,
    "km"
  );
  let avg_speed = 20;
  let time_travel_hour = t_distance / avg_speed;
  let time_travel_minute = Math.round(time_travel_hour * 60);
  travel.push(Number(time_travel_minute));
  console.log(travel);
  distance_answer.innerHTML = `<div>distance: ${t_distance.toFixed(0)} km</div>
                               <div>traveling time: ${time_travel_minute} minutes </div>`;
}

cal_distance.addEventListener("click", calculate_distance);
const summerize_button = document.getElementById("summerize_button");
const end_result = document.getElementById("end_result");

function summerize(e) {
  e.preventDefault();
  if (
    rain.length === 0 ||
    travel.length === 0 ||
    plan.list_map.size === 0 ||
    place.list_map.size < 2
  ) {
    end_result.innerHTML = `<div>please first fill out all forms.</div>`;
    return;
  }

  let time_schedule_arr = [];
  for (const value of plan.list_map.values()) {
    time_schedule_arr.push(value);
  }
  let action_schedule_arr = [];
  for (const key of plan.list_map.keys()) {
    action_schedule_arr.push(key);
  }

  let true_num_Array = time_schedule_arr.map(Number);
  let t_length = true_num_Array.length - 1;
  let time_sum = [];
  for (let i = t_length; i >= 0; i--) {
    let partialSum = true_num_Array
      .slice(0, i + 1)
      .reduce((sum, current) => sum + current, 0);
    time_sum.push(partialSum);

    console.log(partialSum);
  }
  console.log("answer", time_sum);
  console.log(travel[0]);
  console.log(rain[0]);
  if (travel[0] > rain[0]) {
    end_result.innerHTML = `<div/>you don't have enough time to get to destinations, pick umbrella and hurry out now or stay inside. </div>`;
    return;
  }
  if (travel[0] + time_sum[0] <= rain[0]) {
    end_result.innerHTML = `<div>relax,you have got enough time to do all your chores.</div>`;
  } else if (travel[0] + time_sum[1] <= rain[0]) {
    end_result.innerHTML = `<div>you have only got time to do 3 actions.${action_schedule_arr[0]},${action_schedule_arr[1]} and ${action_schedule_arr[2]}.</div> `;
  } else if (travel[0] + time_sum[2] <= rain[0]) {
    end_result.innerHTML = `<div> you have only got time to do 2 things. ${action_schedule_arr[0]} and ${action_schedule_arr[1]}. </div>`;
  } else if (travel[0] + time_sum[3] <= rain[0]) {
    end_result.innerHTML = `<div>you have only got time to do 1 thing. ${action_schedule_arr[0]}. </div>`;
  } else {
    end_result.innerHTML = `<div>you have barely enough time to get to your destination. </div>`;
  }
}
summerize_button.addEventListener("click", summerize);


