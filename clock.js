const clockCards = document.querySelectorAll(".clock-card");

function getTimeParts(timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  });

  const parts = formatter.formatToParts(new Date());

  const values = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }

  return values;
}

function createClockMarkers(clockCard) {
  const markerContainer =
    clockCard.querySelector(".clock-markers");

  markerContainer.innerHTML = "";

  for (let markerNumber = 0; markerNumber < 60; markerNumber++) {
    const marker = document.createElement("div");

    marker.className = "clock-marker";

    if (markerNumber % 5 === 0) {
      marker.classList.add("major");
    }

    marker.style.transform =
      `rotate(${markerNumber * 6}deg)`;

    markerContainer.appendChild(marker);
  }
}

function updateClock(clockCard) {
  const timeZone =
    clockCard.dataset.timeZone;

  const parts =
    getTimeParts(timeZone);

  const hours =
    Number(parts.hour) % 12;

  const minutes =
    Number(parts.minute);

  const seconds =
    Number(parts.second);

  const hourDegrees =
    (hours * 30) +
    (minutes * 0.5) +
    (seconds / 120);

  const minuteDegrees =
    (minutes * 6) +
    (seconds * 0.1);

  const secondDegrees =
    seconds * 6;

  clockCard.querySelector(".hour-hand").style.transform =
    `translateX(-50%) rotate(${hourDegrees}deg)`;

  clockCard.querySelector(".minute-hand").style.transform =
    `translateX(-50%) rotate(${minuteDegrees}deg)`;

  clockCard.querySelector(".second-hand").style.transform =
    `translateX(-50%) rotate(${secondDegrees}deg)`;

  clockCard.querySelector(".digital-time").textContent =
    `${parts.hour}:${parts.minute}:${parts.second}`;

  clockCard.querySelector(".local-date").textContent =
    `${parts.weekday}, ${parts.month} ${parts.day}, ${parts.year}`;
}

function updateAllClocks() {
  clockCards.forEach(updateClock);
}

clockCards.forEach(createClockMarkers);

updateAllClocks();

setInterval(updateAllClocks, 1000);