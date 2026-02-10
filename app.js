let armed = false;
let triggered = false;
let countdownTimer;
let impactTime = 0;
let startTime = 0;

const ACC_THRESHOLD = 28;
const TIME_WINDOW = 1000;
const ARM_DELAY = 3000;

// --- DEVICE CHECK ---
const isMobile =
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) &&
  "DeviceMotionEvent" in window;

document.getElementById("device").innerText =
  isMobile ? "Mobile device detected" : "Desktop / Unsupported device";

document.getElementById("startBtn").onclick = () => {
  if (!isMobile) {
    alert("Motion sensors not supported on this device");
    return;
  }

  armed = true;
  triggered = false;
  impactTime = 0;
  startTime = Date.now();
  document.getElementById("status").innerText = "Armed";
};

window.addEventListener("devicemotion", (event) => {
  if (!armed || triggered || !isMobile) return;

  if (Date.now() - startTime < ARM_DELAY) return;

  const ax = event.accelerationIncludingGravity?.x;
  const ay = event.accelerationIncludingGravity?.y;
  const az = event.accelerationIncludingGravity?.z;

  // HARD REJECTION
  if (ax === null || ay === null || az === null) return;

  // Reject zero vectors (PC/browser fake data)
  if (ax === 0 && ay === 0 && az === 0) return;

  const A = Math.sqrt(ax*ax + ay*ay + az*az);
  document.getElementById("acc").innerText = A.toFixed(2);

  // Reject gravity-only flat readings
  if (A < 9 || A > 80) return;

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
  });
}
