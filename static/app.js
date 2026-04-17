const timersRoot = document.getElementById("timers");
const template = document.getElementById("timerTemplate");
const statusText = document.getElementById("statusText");

const newTimerBtn = document.getElementById("newTimerBtn");
const createDialog = document.getElementById("createDialog");
const createForm = document.getElementById("createForm");

const nameInput = document.getElementById("nameInput");
const minutesInput = document.getElementById("minutesInput");
const secondsInput = document.getElementById("secondsInput");

const storageKey = "linux_timer_app_items";
const timerMap = new Map();

function format(totalSeconds) {
  const safeValue = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeValue / 3600);
  const mins = Math.floor((safeValue % 3600) / 60);
  const secs = safeValue % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function saveState() {
  const serializable = Array.from(timerMap.values()).map((timer) => ({
    id: timer.id,
    title: timer.title,
    duration: timer.duration,
    remaining: timer.remaining,
    running: false,
  }));

  localStorage.setItem(storageKey, JSON.stringify(serializable));
}

function playDoneSignal() {
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.value = 0.08;

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.25);
  } catch {
    // Fallback: do nothing if WebAudio is unavailable.
  }
}

function updateStatusText() {
  const runningTimers = Array.from(timerMap.values()).filter((timer) => timer.running).length;
  if (runningTimers === 0) {
    statusText.textContent = "Bereit";
    return;
  }

  statusText.textContent = `${runningTimers} Timer aktiv`;
}

function stopTimer(timer) {
  if (timer.intervalHandle) {
    clearInterval(timer.intervalHandle);
    timer.intervalHandle = null;
  }
  timer.running = false;
  updateStatusText();
  saveState();
}

function renderTimer(timer) {
  timer.readout.textContent = format(timer.remaining);
  const progress = timer.duration > 0 ? (timer.remaining / timer.duration) * 100 : 0;
  timer.progress.style.width = `${Math.max(0, Math.min(100, progress))}%`;
}

function createTimer({ id = crypto.randomUUID(), title, duration, remaining = duration }) {
  const fragment = template.content.cloneNode(true);
  const card = fragment.querySelector(".timer-card");
  const titleNode = fragment.querySelector(".timer-title");
  const readout = fragment.querySelector(".time-readout");
  const progress = fragment.querySelector(".progress-bar");

  const startBtn = fragment.querySelector(".play-btn");
  const pauseBtn = fragment.querySelector(".pause-btn");
  const resetBtn = fragment.querySelector(".reset-btn");
  const deleteBtn = fragment.querySelector(".delete-btn");

  titleNode.textContent = title;

  const timer = {
    id,
    title,
    duration,
    remaining,
    intervalHandle: null,
    running: false,
    readout,
    progress,
  };

  startBtn.addEventListener("click", () => {
    if (timer.running || timer.remaining <= 0) return;
    timer.running = true;

    timer.intervalHandle = setInterval(() => {
      timer.remaining -= 1;
      renderTimer(timer);

      if (timer.remaining <= 0) {
        timer.remaining = 0;
        stopTimer(timer);
        renderTimer(timer);
        playDoneSignal();
        alert(`Timer \"${timer.title}\" ist abgelaufen.`);
      }

      saveState();
    }, 1000);

    updateStatusText();
  });

  pauseBtn.addEventListener("click", () => stopTimer(timer));

  resetBtn.addEventListener("click", () => {
    stopTimer(timer);
    timer.remaining = timer.duration;
    renderTimer(timer);
    saveState();
  });

  deleteBtn.addEventListener("click", () => {
    stopTimer(timer);
    timerMap.delete(timer.id);
    card.remove();
    updateStatusText();
    saveState();
  });

  timersRoot.appendChild(fragment);
  timerMap.set(timer.id, timer);
  renderTimer(timer);
  updateStatusText();
  saveState();
}

function addTimerFromForm() {
  const minutes = Number(minutesInput.value || 0);
  const seconds = Number(secondsInput.value || 0);
  const duration = minutes * 60 + seconds;
  const title = (nameInput.value || "Timer").trim();

  if (duration <= 0) {
    alert("Bitte eine Zeit größer als 0 eingeben.");
    return;
  }

  createTimer({ title, duration });
  createDialog.close();
  createForm.reset();
  minutesInput.value = "5";
  secondsInput.value = "0";
}

newTimerBtn.addEventListener("click", () => createDialog.showModal());

createForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTimerFromForm();
});

document.querySelectorAll(".preset").forEach((button) => {
  button.addEventListener("click", () => {
    const minutes = Number(button.dataset.minutes);
    createTimer({ title: `${minutes} Min`, duration: minutes * 60 });
  });
});

(function loadState() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    createTimer({ title: "5 Min", duration: 300 });
    return;
  }

  try {
    const savedItems = JSON.parse(raw);
    if (!Array.isArray(savedItems) || savedItems.length === 0) {
      createTimer({ title: "5 Min", duration: 300 });
      return;
    }

    savedItems.forEach((item) => {
      if (!item || typeof item.duration !== "number" || typeof item.title !== "string") return;
      createTimer({
        id: item.id,
        title: item.title,
        duration: item.duration,
        remaining: typeof item.remaining === "number" ? item.remaining : item.duration,
      });
    });
  } catch {
    createTimer({ title: "5 Min", duration: 300 });
  }
})();
