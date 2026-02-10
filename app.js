let monitoring = false;
let triggered = false;
let countdownTimer;
let impactTime = 0;

const ACC_THRESHOLD = 20;   // m/s²
const TIME_WINDOW = 1000;   // 1 second

document.getElementById("startBtn").onclick = () => {
  monitoring = true;
  alert("Monitoring started");
};

window.addEventListener("devicemotion", (event) => {
  if (!monitoring || triggered) return;

  const x = event.accelerationIncludingGravity.x || 0;
  const y = event.accelerationIncludingGravity.y || 0;
  const z = event.accelerationIncludingGravity.z || 0;

  const A = Math.sqrt(x*x + y*y + z*z);
  document.getElementById("acc").innerText = A.toFixed(2);

  const now = Date.now();

  if (A >= ACC_THRESHOLD) {
    if (impactTime === 0) {
      impactTime = now;
    }

    if (now - impactTime <= TIME_WINDOW) {
      triggerAlarm();
    }
  } else {
    impactTime = 0;
  }
});

function triggerAlarm() {
  triggered = true;
  let timeLeft = 10;

  document.getElementById("alarm").classList.remove("hidden");
  document.getElementById("timer").innerText = timeLeft;

  countdownTimer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").innerText = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(countdownTimer);
      sendEmergency();
    }
  }, 1000);
}

document.getElementById("safeBtn").onclick = () => {
  clearInterval(countdownTimer);
  document.getElementById("alarm").classList.add("hidden");
  triggered = false;
  impactTime = 0;
};

function sendEmergency() {
  navigator.geolocation.getCurrentPosition((pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    const message =
      `🚨 Possible bike accident detected!\n` +
      `Location: https://maps.google.com/?q=${lat},${lon}\n` +
      `No response from rider.`;

    // WhatsApp fallback (web limitation)
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }, () => {
    alert("Location access denied");
  });
}


