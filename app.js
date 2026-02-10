let monitoring = false;
let countdown;

document.getElementById("startBtn").onclick = () => {
  monitoring = true;
  alert("Monitoring started");
};

window.addEventListener("devicemotion", (event) => {
  if (!monitoring) return;

  const x = event.accelerationIncludingGravity.x || 0;
  const y = event.accelerationIncludingGravity.y || 0;
  const z = event.accelerationIncludingGravity.z || 0;

  const A = Math.sqrt(x*x + y*y + z*z).toFixed(2);
  document.getElementById("acc").innerText = A;
});

document.getElementById("testBtn").onclick = triggerAlarm;

function triggerAlarm() {
  let time = 10;
  document.getElementById("alarm").classList.remove("hidden");
  document.getElementById("timer").innerText = time;

  countdown = setInterval(() => {
    time--;
    document.getElementById("timer").innerText = time;
    if (time <= 0) {
      clearInterval(countdown);
      alert("SEND EMERGENCY MESSAGE (NEXT STEP)");
    }
  }, 1000);
}

document.getElementById("safeBtn").onclick = () => {
  clearInterval(countdown);
  document.getElementById("alarm").classList.add("hidden");
};
