document.addEventListener("DOMContentLoaded", () => {
const friends = {
harley: {
id: "harley",
name: "Harley",
mascot: "🦊",
city: "Portland",
timeZone: "America/Los_Angeles",
latitude: 45.51512,
longitude: -122.67948,
hemisphere: "north",
preferredTemperature: "F",
birthday: {
month: 4,
day: 10,
message: "Happy birthday, bitch!"
}
},

avery: {
id: "avery",
name: "Avery",
mascot: "🥦",
city: "Saint-Eustache",
timeZone: "America/Toronto",
latitude: 45.55762,
longitude: -73.88864,
hemisphere: "north",
preferredTemperature: "C",
birthday: {
month: 9,
day: 24,
message: "Happy birthday, hoser!"
}
},

sarah: {
id: "sarah",
name: "Sarah",
mascot: "🦈",
city: "Manjimup",
timeZone: "Australia/Perth",
latitude: -34.25,
longitude: 116.15,
hemisphere: "south",
preferredTemperature: "C",
birthday: {
month: 4,
day: 28,
message: "Happy birthday, cunt!"
}
}
};

const clockCards =
Array.from(document.querySelectorAll(".clock-card"));

const weatherState = new Map();
const latestTimeState = new Map();
const celebratedBirthdayKeys = new Set();

const reducedMotion =
window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function partsToObject(parts) {
const values = {};

for (const part of parts) {
if (part.type !== "literal") {
values[part.type] = part.value;
}
}

return values;
}

function getTimeParts(timeZone) {
const now = new Date();

const timeFormatter =
new Intl.DateTimeFormat("en-US", {
timeZone,
hour: "numeric",
minute: "2-digit",
second: "2-digit",
hour12: true
});

const dateFormatter =
new Intl.DateTimeFormat("en-US", {
timeZone,
weekday: "long",
year: "numeric",
month: "long",
day: "numeric"
});

const numericFormatter =
new Intl.DateTimeFormat("en-US", {
timeZone,
year: "numeric",
month: "2-digit",
day: "2-digit",
hour: "2-digit",
minute: "2-digit",
second: "2-digit",
hourCycle: "h23"
});

const weekdayFormatter =
new Intl.DateTimeFormat("en-US", {
timeZone,
weekday: "long"
});

const numeric =
partsToObject(numericFormatter.formatToParts(now));

return {
now,
displayTime: timeFormatter.format(now),
displayDate: dateFormatter.format(now),
weekday: weekdayFormatter.format(now),
dateKey: `${numeric.year}-${numeric.month}-${numeric.day}`,
year: Number(numeric.year),
month: Number(numeric.month),
day: Number(numeric.day),
hour: Number(numeric.hour),
minute: Number(numeric.minute),
second: Number(numeric.second)
};
}

function createClockMarkers(clockCard) {
const markerContainer =
clockCard.querySelector(".clock-markers");

if (!markerContainer) {
return;
}

markerContainer.innerHTML = "";

for (
let markerNumber = 0;
markerNumber < 60;
markerNumber++
) {
const marker =
document.createElement("div");

marker.className = "clock-marker";

if (markerNumber % 5 === 0) {
marker.classList.add("major");
}

marker.style.transform =
`rotate(${markerNumber * 6}deg)`;

markerContainer.appendChild(marker);
}
}

function formatHourMinute(hour, minute) {
const period = hour >= 12 ? "PM" : "AM";
const displayHour = hour % 12 || 12;
const displayMinute = String(minute).padStart(2, "0");

return `${displayHour}:${displayMinute} ${period}`;
}

function minutesFromLocalIso(localIso) {
if (!localIso || !localIso.includes("T")) {
return null;
}

const timePart = localIso.split("T")[1];
const [hourText, minuteText] = timePart.split(":");

const hour = Number(hourText);
const minute = Number(minuteText);

if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
return null;
}

return (hour * 60) + minute;
}

function formatLocalIsoTime(localIso) {
const minutes = minutesFromLocalIso(localIso);

if (minutes === null) {
return "--";
}

const hour = Math.floor(minutes / 60);
const minute = minutes % 60;

return formatHourMinute(hour, minute);
}

function getTimePeriod(time, weather) {
const currentMinutes =
(time.hour * 60) + time.minute;

const sunrise =
minutesFromLocalIso(weather?.sunrise);

const sunset =
minutesFromLocalIso(weather?.sunset);

if (sunrise !== null && sunset !== null) {
const dawnStart = sunrise - 45;
const dawnEnd = sunrise + 30;
const solarMidpoint = sunrise + ((sunset - sunrise) / 2);
const eveningStart = sunset - 60;
const nightStart = sunset + 30;

if (
currentMinutes < dawnStart ||
currentMinutes >= nightStart
) {
return {
key: "night",
label: "🌙 Night",
summary: "night"
};
}

if (currentMinutes < dawnEnd) {
return {
key: "dawn",
label: "🌅 Dawn",
summary: "dawn"
};
}

if (currentMinutes < solarMidpoint) {
return {
key: "morning",
label: "☀️ Morning",
summary: "morning"
};
}

if (currentMinutes < eveningStart) {
return {
key: "afternoon",
label: "🌤️ Afternoon",
summary: "afternoon"
};
}

return {
key: "evening",
label: "🌇 Evening",
summary: "evening"
};
}

if (time.hour < 6 || time.hour >= 21) {
return {
key: "night",
label: "🌙 Night",
summary: "night"
};
}

if (time.hour < 8) {
return {
key: "dawn",
label: "🌅 Dawn",
summary: "dawn"
};
}

if (time.hour < 12) {
return {
key: "morning",
label: "☀️ Morning",
summary: "morning"
};
}

if (time.hour < 18) {
return {
key: "afternoon",
label: "🌤️ Afternoon",
summary: "afternoon"
};
}

return {
key: "evening",
label: "🌇 Evening",
summary: "evening"
};
}

function julianDayToDate(julianDay) {
return new Date(
(julianDay - 2440587.5) * 86400000
);
}

function getAstronomicalBoundaries(year) {
const y = (year - 2000) / 1000;

const marchEquinox =
2451623.80984 +
(365242.37404 * y) +
(0.05169 * (y ** 2)) -
(0.00411 * (y ** 3)) -
(0.00057 * (y ** 4));

const juneSolstice =
2451716.56767 +
(365241.62603 * y) +
(0.00325 * (y ** 2)) +
(0.00888 * (y ** 3)) -
(0.00030 * (y ** 4));

const septemberEquinox =
2451810.21715 +
(365242.01767 * y) -
(0.11575 * (y ** 2)) +
(0.00337 * (y ** 3)) +
(0.00078 * (y ** 4));

const decemberSolstice =
2451900.05952 +
(365242.74049 * y) -
(0.06223 * (y ** 2)) -
(0.00823 * (y ** 3)) +
(0.00032 * (y ** 4));

return {
marchEquinox: julianDayToDate(marchEquinox),
juneSolstice: julianDayToDate(juneSolstice),
septemberEquinox: julianDayToDate(septemberEquinox),
decemberSolstice: julianDayToDate(decemberSolstice)
};
}

function getSeasonInfo(now, hemisphere) {
const year = now.getUTCFullYear();
const boundaries = getAstronomicalBoundaries(year);

let northernSeason;

if (now < boundaries.marchEquinox) {
northernSeason = "winter";
} else if (now < boundaries.juneSolstice) {
northernSeason = "spring";
} else if (now < boundaries.septemberEquinox) {
northernSeason = "summer";
} else if (now < boundaries.decemberSolstice) {
northernSeason = "autumn";
} else {
northernSeason = "winter";
}

const southernOpposite = {
winter: "summer",
spring: "autumn",
summer: "winter",
autumn: "spring"
};

const season =
hemisphere === "south"
? southernOpposite[northernSeason]
: northernSeason;

const seasonDetails = {
spring: {
label: "Spring",
icon: "🌸"
},
summer: {
label: "Summer",
icon: "☀️"
},
autumn: {
label: "Autumn",
icon: "🍂"
},
winter: {
label: "Winter",
icon: "❄️"
}
};

return seasonDetails[season];
}

function getWeatherDetails(code, isDay) {
const weatherCode = Number(code);

if (weatherCode === 0) {
return {
label: "Clear",
icon: isDay ? "☀️" : "🌙",
effect: null
};
}

if (weatherCode === 1) {
return {
label: "Mostly clear",
icon: isDay ? "🌤️" : "🌙",
effect: null
};
}

if (weatherCode === 2) {
return {
label: "Partly cloudy",
icon: "⛅",
effect: null
};
}

if (weatherCode === 3) {
return {
label: "Overcast",
icon: "☁️",
effect: null
};
}

if ([45, 48].includes(weatherCode)) {
return {
label: "Foggy",
icon: "🌫️",
effect: null
};
}

if ([51, 53, 55, 56, 57].includes(weatherCode)) {
return {
label: "Drizzle",
icon: "🌦️",
effect: "rain"
};
}

if ([61, 63, 65, 66, 67].includes(weatherCode)) {
return {
label: "Rain",
icon: "🌧️",
effect: "rain"
};
}

if ([71, 73, 75, 77].includes(weatherCode)) {
return {
label: "Snow",
icon: "🌨️",
effect: "snow"
};
}

if ([80, 81, 82].includes(weatherCode)) {
return {
label: "Rain showers",
icon: "🌦️",
effect: "rain"
};
}

if ([85, 86].includes(weatherCode)) {
return {
label: "Snow showers",
icon: "🌨️",
effect: "snow"
};
}

if ([95, 96, 99].includes(weatherCode)) {
return {
label: "Thunderstorms",
icon: "⛈️",
effect: "rain"
};
}

return {
label: "Current weather",
icon: "🌡️",
effect: null
};
}

function formatTemperature(celsius, preferredUnit) {
const c = Math.round(celsius);
const f = Math.round((celsius * 9 / 5) + 32);

if (preferredUnit === "F") {
return `${f}°F · ${c}°C`;
}

return `${c}°C · ${f}°F`;
}

function setWeatherEffect(container, effect) {
container.innerHTML = "";

if (reducedMotion || !effect) {
return;
}

const count = effect === "snow" ? 14 : 12;

for (let index = 0; index < count; index++) {
const particle = document.createElement("span");

particle.className =
effect === "snow"
? "weather-snowflake"
: "weather-drop";

particle.style.left =
`${(index * 29 + 7) % 100}%`;

particle.style.animationDelay =
`${-((index * 0.43) % 5)}s`;

particle.style.animationDuration =
effect === "snow"
? `${4.5 + ((index % 5) * 0.55)}s`
: `${0.85 + ((index % 4) * 0.16)}s`;

container.appendChild(particle);
}
}

function renderWeather(friend, clockCard, weather) {
const currentTime = getTimeParts(friend.timeZone);
const period = getTimePeriod(currentTime, weather);
const season = getSeasonInfo(currentTime.now, friend.hemisphere);
const details = getWeatherDetails(weather.weatherCode, weather.isDay);

const windowElement =
clockCard.querySelector(".world-window");

const weatherIcon =
clockCard.querySelector(".weather-icon");

const condition =
clockCard.querySelector(".weather-condition");

const temperature =
clockCard.querySelector(".temperature");

const timeOfDay =
clockCard.querySelector(".time-of-day");

const seasonElement =
clockCard.querySelector(".season");

const sunTimes =
clockCard.querySelector(".sun-times");

const effectContainer =
clockCard.querySelector(".weather-effect");

windowElement.classList.remove(
"period-night",
"period-dawn",
"period-morning",
"period-afternoon",
"period-evening"
);

windowElement.classList.add(`period-${period.key}`);

weatherIcon.textContent = details.icon;
condition.textContent = details.label;
temperature.textContent =
formatTemperature(weather.temperatureC, friend.preferredTemperature);

timeOfDay.textContent = period.label;
seasonElement.textContent = `${season.icon} ${season.label}`;

sunTimes.textContent =
`🌅 ${formatLocalIsoTime(weather.sunrise)} · 🌇 ${formatLocalIsoTime(weather.sunset)}`;

setWeatherEffect(effectContainer, details.effect);
}

function renderWeatherUnavailable(friend, clockCard) {
const currentTime = getTimeParts(friend.timeZone);
const period = getTimePeriod(currentTime, null);
const season = getSeasonInfo(currentTime.now, friend.hemisphere);

const windowElement =
clockCard.querySelector(".world-window");

windowElement.classList.remove(
"period-night",
"period-dawn",
"period-morning",
"period-afternoon",
"period-evening"
);

windowElement.classList.add(`period-${period.key}`);

clockCard.querySelector(".weather-icon").textContent = "🌡️";
clockCard.querySelector(".weather-condition").textContent =
"Weather unavailable";
clockCard.querySelector(".temperature").textContent =
"The clocks are still working.";
clockCard.querySelector(".time-of-day").textContent = period.label;
clockCard.querySelector(".season").textContent =
`${season.icon} ${season.label}`;
clockCard.querySelector(".sun-times").textContent =
"Sunrise and sunset unavailable";

setWeatherEffect(clockCard.querySelector(".weather-effect"), null);
}

async function fetchWeather(friend, clockCard) {
const params = new URLSearchParams({
latitude: String(friend.latitude),
longitude: String(friend.longitude),
current: "temperature_2m,weather_code,is_day",
daily: "sunrise,sunset",
timezone: "auto",
forecast_days: "1"
});

const url =
`https://api.open-meteo.com/v1/forecast?${params.toString()}`;

try {
const response = await fetch(url);

if (!response.ok) {
throw new Error(`Weather request failed with ${response.status}`);
}

const data = await response.json();

if (
typeof data.current?.temperature_2m !== "number" ||
typeof data.current?.weather_code !== "number"
) {
throw new Error("Weather response was missing current conditions.");
}

const weather = {
temperatureC: data.current.temperature_2m,
weatherCode: data.current.weather_code,
isDay: data.current.is_day === 1,
sunrise: data.daily?.sunrise?.[0] ?? null,
sunset: data.daily?.sunset?.[0] ?? null
};

weatherState.set(friend.id, weather);
renderWeather(friend, clockCard, weather);
} catch (error) {
console.warn(`Weather unavailable for ${friend.city}:`, error);
weatherState.delete(friend.id);
renderWeatherUnavailable(friend, clockCard);
}
}

function isBirthday(friend, time) {
return (
time.month === friend.birthday.month &&
time.day === friend.birthday.day
);
}

function launchConfetti() {
if (reducedMotion) {
return;
}

const layer = document.querySelector("#confetti-layer");

if (!layer) {
return;
}

const colors = [
"#ff5757",
"#54ddff",
"#ad72ff",
"#ffd166",
"#ff8fab",
"#8ee3a3"
];

for (let index = 0; index < 78; index++) {
const piece = document.createElement("span");
const color = colors[index % colors.length];
const left = (index * 43 + 11) % 100;
const delay = (index % 13) * 0.035;
const duration = 3.8 + ((index % 9) * 0.18);
const drift = ((index % 2 === 0 ? 1 : -1) * (18 + (index % 32)));
const spin = 360 + ((index % 8) * 120);

piece.className = "confetti-piece";
piece.style.left = `${left}%`;
piece.style.setProperty("--confetti-color", color);
piece.style.setProperty("--confetti-delay", `${delay}s`);
piece.style.setProperty("--confetti-duration", `${duration}s`);
piece.style.setProperty("--confetti-drift", `${drift}px`);
piece.style.setProperty("--confetti-spin", `${spin}deg`);

layer.appendChild(piece);
}

window.setTimeout(() => {
layer.innerHTML = "";
}, 6500);
}

function updateBirthdayState(friend, clockCard, time) {
const banner =
clockCard.querySelector(".birthday-banner");

if (!isBirthday(friend, time)) {
clockCard.classList.remove("birthday-mode");
banner.textContent = "";
return;
}

clockCard.classList.add("birthday-mode");
banner.textContent = `🎂 ${friend.birthday.message}`;

const celebrationKey = `${friend.id}-${time.dateKey}`;

if (!celebratedBirthdayKeys.has(celebrationKey)) {
celebratedBirthdayKeys.add(celebrationKey);
launchConfetti();
}
}

function updateClock(clockCard) {
const friendId = clockCard.dataset.friend;
const friend = friends[friendId];

if (!friend) {
return;
}

const time = getTimeParts(friend.timeZone);
latestTimeState.set(friend.id, time);

const hours = time.hour % 12;

const hourDegrees =
(hours * 30) +
(time.minute * 0.5) +
(time.second / 120);

const minuteDegrees =
(time.minute * 6) +
(time.second * 0.1);

const secondDegrees =
time.second * 6;

const hourHand =
clockCard.querySelector(".hour-hand");

const minuteHand =
clockCard.querySelector(".minute-hand");

const secondHand =
clockCard.querySelector(".second-hand");

const digitalTime =
clockCard.querySelector(".digital-time");

const localDate =
clockCard.querySelector(".local-date");

hourHand.style.transform =
`translateX(-50%) rotate(${hourDegrees}deg)`;

minuteHand.style.transform =
`translateX(-50%) rotate(${minuteDegrees}deg)`;

secondHand.style.transform =
`translateX(-50%) rotate(${secondDegrees}deg)`;

digitalTime.textContent = time.displayTime;
localDate.textContent = time.displayDate;

const weather = weatherState.get(friend.id) ?? null;
const period = getTimePeriod(time, weather);
const season = getSeasonInfo(time.now, friend.hemisphere);

const windowElement =
clockCard.querySelector(".world-window");

windowElement.classList.remove(
"period-night",
"period-dawn",
"period-morning",
"period-afternoon",
"period-evening"
);

windowElement.classList.add(`period-${period.key}`);

clockCard.querySelector(".time-of-day").textContent =
period.label;

clockCard.querySelector(".season").textContent =
`${season.icon} ${season.label}`;

updateBirthdayState(friend, clockCard, time);
}

function getTimeZoneOffsetMinutes(timeZone, now) {
const roundedNow =
new Date(Math.floor(now.getTime() / 1000) * 1000);

const formatter =
new Intl.DateTimeFormat("en-US", {
timeZone,
year: "numeric",
month: "2-digit",
day: "2-digit",
hour: "2-digit",
minute: "2-digit",
second: "2-digit",
hourCycle: "h23"
});

const parts =
partsToObject(formatter.formatToParts(roundedNow));

const representedAsUtc =
Date.UTC(
Number(parts.year),
Number(parts.month) - 1,
Number(parts.day),
Number(parts.hour),
Number(parts.minute),
Number(parts.second)
);

return Math.round(
(representedAsUtc - roundedNow.getTime()) / 60000
);
}

function formatSpanMinutes(minutes) {
const hours = minutes / 60;

if (Number.isInteger(hours)) {
return `${hours} ${hours === 1 ? "hour" : "hours"}`;
}

return `${hours.toFixed(1)} hours`;
}

function updateBetweenUs() {
const entries = Object.values(friends)
.map((friend) => ({
friend,
time: latestTimeState.get(friend.id)
}))
.filter((entry) => entry.time);

if (entries.length !== Object.keys(friends).length) {
return;
}

for (const { friend, time } of entries) {
const summary =
document.querySelector(`[data-summary="${friend.id}"]`);

const period =
getTimePeriod(
time,
weatherState.get(friend.id) ?? null
);

summary.textContent =
`${friend.mascot} It’s ${period.summary} in ${friend.city}.`;
}

const groups = new Map();

for (const { friend, time } of entries) {
if (!groups.has(time.dateKey)) {
groups.set(time.dateKey, {
weekday: time.weekday,
displayDate: time.displayDate,
cities: []
});
}

groups.get(time.dateKey).cities.push(friend.city);
}

const dateBridge = document.querySelector(".date-bridge");

if (groups.size === 1) {
const onlyGroup = Array.from(groups.values())[0];
dateBridge.textContent =
`All three places are on ${onlyGroup.displayDate}.`;
} else {
const orderedGroups =
Array.from(groups.entries())
.sort(([dateA], [dateB]) => dateA.localeCompare(dateB));

dateBridge.textContent =
orderedGroups
.map(([, group]) => {
const cityText =
group.cities.length === 1
? group.cities[0]
: `${group.cities.slice(0, -1).join(", ")} and ${group.cities.at(-1)}`;

return `${cityText}: ${group.weekday}`;
})
.join(" · ");
}

const now = new Date();

const offsets =
entries.map(({ friend }) =>
getTimeZoneOffsetMinutes(friend.timeZone, now)
);

const spread = Math.max(...offsets) - Math.min(...offsets);

document.querySelector(".time-span").textContent =
`The three clocks currently span ${formatSpanMinutes(spread)}.`;
}

function updateAllClocks() {
clockCards.forEach(updateClock);
updateBetweenUs();
}

function refreshAllWeather() {
for (const clockCard of clockCards) {
const friend = friends[clockCard.dataset.friend];

if (friend) {
fetchWeather(friend, clockCard);
}
}
}

clockCards.forEach(createClockMarkers);

updateAllClocks();
refreshAllWeather();

window.setInterval(updateAllClocks, 1000);
window.setInterval(refreshAllWeather, 10 * 60 * 1000);
});