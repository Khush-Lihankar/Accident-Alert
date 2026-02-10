let armed = false;
let triggered = false;
let countdownTimer;
let impactTime = 0;
let startTime = 0;

const ACC_THRESHOLD = 28;   // real accident level
const TIME_WINDOW = 1000;   // 1 second
const ARM_DELAY = 3000;     // ignore first 3 seconds

document.getElementById("startBtn").onclick = () => {
  armed = true;
  triggered = false;
  impactTime = 0;
  startTime = Date.now();
  document.getElementById("status").innerText = "Armed";
  alert("Monitoring armed. Stabilizing sensors...");
};

window.addEventListener("devicemotion", (event) => {
  if (!armed || triggered) return;

  // Ignore early garbage data
  if (Date.now() - startTime < ARM_DELAY) return;

  const ax = event.accelerationIncludingGravity.x;
  const ay = event.accelerationIncludingGravity.y;
  const az = event.accelerationIncludingGravity.z;

  // Reject invalid readings
  if (ax === null || ay === null || az === null) return;

  const A = Math.sqrt(ax*ax + ay*ay + az*az);
  document.getElementById("acc").innerText = A.toFixed(2);

  // Reject impossible spikes (browser glitch)
  if (A > 80) return;

  const now = Date.now();

  if (A >= ACC_THRESHOLD) {
    if (impactTime === 0) impactTime = now;

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

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  }, () => {
    alert("Location access denied");
  });
}
