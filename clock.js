document.addEventListener("DOMContentLoaded", () => {
  const clockCards =
    document.querySelectorAll(".clock-card");

  function getTimeParts(timeZone) {
    const now = new Date();

    const timeFormatter =
      new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour: "2-digit",
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
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false
      });

    const numericParts =
      numericFormatter.formatToParts(now);

    const values = {};

    for (const part of numericParts) {
      if (part.type !== "literal") {
        values[part.type] = part.value;
      }
    }

    return {
      displayTime: timeFormatter.format(now),
      displayDate: dateFormatter.format(now),
      hour: Number(values.hour) % 24,
      minute: Number(values.minute),
      second: Number(values.second)
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

  function updateClock(clockCard) {
    const timeZone =
      clockCard.dataset.timeZone;

    const time =
      getTimeParts(timeZone);

    const hours =
      time.hour % 12;

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

    if (hourHand) {
      hourHand.style.transform =
        `translateX(-50%) rotate(${hourDegrees}deg)`;
    }

    if (minuteHand) {
      minuteHand.style.transform =
        `translateX(-50%) rotate(${minuteDegrees}deg)`;
    }

    if (secondHand) {
      secondHand.style.transform =
        `translateX(-50%) rotate(${secondDegrees}deg)`;
    }

    if (digitalTime) {
      digitalTime.textContent =
        time.displayTime;
    }

    if (localDate) {
      localDate.textContent =
        time.displayDate;
    }
  }

  function updateAllClocks() {
    clockCards.forEach(updateClock);
  }

  clockCards.forEach(createClockMarkers);

  updateAllClocks();

  setInterval(updateAllClocks, 1000);
});