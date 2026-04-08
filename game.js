const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const urlParams = new URLSearchParams(window.location.search);

if (urlParams.has("capture")) {
  document.body.classList.add(`capture-${urlParams.get("capture") || "default"}`);
}

const ui = {
  overlay: document.getElementById("overlay"),
  overlayEyebrow: document.getElementById("overlayEyebrow"),
  overlayTitle: document.getElementById("overlayTitle"),
  overlayCopy: document.getElementById("overlayCopy"),
  menuPanel: document.getElementById("menuPanel"),
  settingsPanel: document.getElementById("settingsPanel"),
  modeSubcopy: document.getElementById("modeSubcopy"),
  startButton: document.getElementById("startButton"),
  resumeButton: document.getElementById("resumeButton"),
  restartButton: document.getElementById("restartButton"),
  openSettingsButton: document.getElementById("openSettingsButton"),
  backButton: document.getElementById("backButton"),
  mainMenuButton: document.getElementById("mainMenuButton"),
  musicButton: document.getElementById("musicButton"),
  pauseHudButton: document.getElementById("pauseHudButton"),
  menuHudButton: document.getElementById("menuHudButton"),
  settingsHudButton: document.getElementById("settingsHudButton"),
  statusLine: document.getElementById("statusLine"),
  speedValue: document.getElementById("speedValue"),
  lapValue: document.getElementById("lapValue"),
  timeValue: document.getElementById("timeValue"),
  lapTimeValue: document.getElementById("lapTimeValue"),
  scoreValue: document.getElementById("scoreValue"),
  comboValue: document.getElementById("comboValue"),
  nitroValue: document.getElementById("nitroValue"),
  integrityValue: document.getElementById("integrityValue"),
  nitroFill: document.getElementById("nitroFill"),
  integrityFill: document.getElementById("integrityFill"),
  progressValue: document.getElementById("progressValue"),
  progressFill: document.getElementById("progressFill"),
  comboWindowValue: document.getElementById("comboWindowValue"),
  comboFill: document.getElementById("comboFill"),
  countdown: document.getElementById("countdown"),
  toast: document.getElementById("toast"),
  trafficDensityInput: document.getElementById("trafficDensityInput"),
  trafficDensityValue: document.getElementById("trafficDensityValue"),
  cameraShakeInput: document.getElementById("cameraShakeInput"),
  cameraShakeValue: document.getElementById("cameraShakeValue"),
  dayNightCycleInput: document.getElementById("dayNightCycleInput"),
  dayNightCycleValue: document.getElementById("dayNightCycleValue"),
  touchControlsInput: document.getElementById("touchControlsInput"),
  touchControlsValue: document.getElementById("touchControlsValue"),
  modeButtons: [...document.querySelectorAll(".mode-button")],
  touchButtons: [...document.querySelectorAll("[data-touch-input]")],
};

const STORAGE_PREFIX = "neon-apex-record-";
const SETTINGS_STORAGE_KEY = "neon-apex-settings";
const TOTAL_LAPS = 3;
const OVERLAY_SCREENS = {
  menu: "menu",
  settings: "settings",
  pause: "pause",
  gameover: "gameover",
  finish: "finish",
};
const DEFAULT_SETTINGS = {
  trafficDensity: 100,
  cameraShake: true,
  dayNightCycle: true,
  touchControls: true,
};
const MODES = {
  classic: {
    id: "classic",
    name: "Classic",
    subtitle: "Classic mode active",
    overlayEyebrow: "Grand Circuit",
    overlayTitle: "Launch Into Neon Apex",
    overlayCopy: "Three full laps across the chrome desert with traffic, surge gates, and pure arcade pressure. Clean driving wins here.",
    laps: TOTAL_LAPS,
    trafficCount: 24,
    pickupSpacing: 58,
    timeLimit: null,
    endless: false,
    trafficPressure: 1,
    startToast: "Classic Mode. Three laps.",
  },
  time_attack: {
    id: "time_attack",
    name: "Time Attack",
    subtitle: "Time attack mode active",
    overlayEyebrow: "Beat The Clock",
    overlayTitle: "Hold The Line",
    overlayCopy: "Two laps, a hard countdown, and bonus seconds from surge gates and near misses. Push, but do not clip the traffic.",
    laps: 2,
    trafficCount: 20,
    pickupSpacing: 46,
    timeLimit: 70,
    endless: false,
    trafficPressure: 1.06,
    startToast: "Time Attack. Clock is live.",
  },
  survival: {
    id: "survival",
    name: "Survival",
    subtitle: "Survival mode active",
    overlayEyebrow: "Pulse Run",
    overlayTitle: "Stay Alive",
    overlayCopy: "An endless neon gauntlet. Traffic gets faster as the run goes on, and your goal is simple: survive long enough to post a monster score.",
    laps: null,
    trafficCount: 30,
    pickupSpacing: 52,
    timeLimit: null,
    endless: true,
    trafficPressure: 1.18,
    startToast: "Survival Mode. Stay alive.",
  },
};
const DEFAULT_OVERLAY = {
  eyebrow: MODES.classic.overlayEyebrow,
  title: MODES.classic.overlayTitle,
  copy: MODES.classic.overlayCopy,
};

const config = {
  roadWidth: 2100,
  segmentLength: 220,
  rumbleLength: 3,
  lanes: 3,
  cameraHeight: 980,
  drawDistance: 220,
  fieldOfView: 96 * Math.PI / 180,
  maxSpeed: 17200,
  accel: 9200,
  braking: -16000,
  decel: -5200,
  offRoadDecel: -9800,
  offRoadLimit: 7200,
  centrifugal: 0.34,
  boostAccel: 9600,
  driftGripLoss: 3200,
};

config.cameraDepth = 1 / Math.tan(config.fieldOfView / 2);
config.playerZ = config.cameraHeight * config.cameraDepth;

const palette = {
  skyTop: "#04101d",
  skyMid: "#102344",
  skyBottom: "#3b1830",
  roadDark: "#1a1f31",
  roadLight: "#242b43",
  lane: "rgba(242, 245, 255, 0.78)",
  laneGlow: "rgba(78, 231, 255, 0.12)",
  grassDark: "#10211c",
  grassLight: "#173128",
  rumbleA: "#51d9ff",
  rumbleB: "#ff6f9d",
  shoulder: "rgba(255, 255, 255, 0.08)",
};

const SCENE_PALETTES = {
  classic: {
    skyTop: "#04101d",
    skyMid: "#102344",
    skyBottom: "#3b1830",
    roadDark: "#1a1f31",
    roadLight: "#242b43",
    grassDark: "#10211c",
    grassLight: "#173128",
    rumbleA: "#51d9ff",
    rumbleB: "#ff6f9d",
    laneGlow: "rgba(78, 231, 255, 0.12)",
    shoulder: "rgba(255, 255, 255, 0.08)",
    horizonGlow: "rgba(78,231,255,0.12)",
    horizonWarm: "rgba(255,207,103,0.08)",
    sunCore: "rgba(255, 219, 136, 0.98)",
    sunHalo: "rgba(255, 111, 157, 0.52)",
    beam: "#4ee7ff",
    accent: "#4ee7ff",
    accentWarm: "#ffcf67",
    ember: "rgba(255, 207, 103, 0.08)",
  },
  time_attack: {
    skyTop: "#021322",
    skyMid: "#0c3255",
    skyBottom: "#16204f",
    roadDark: "#131f36",
    roadLight: "#1b3150",
    grassDark: "#0c1b23",
    grassLight: "#122739",
    rumbleA: "#64f3ff",
    rumbleB: "#7aa7ff",
    laneGlow: "rgba(121, 211, 255, 0.15)",
    shoulder: "rgba(195, 228, 255, 0.09)",
    horizonGlow: "rgba(111,196,255,0.15)",
    horizonWarm: "rgba(116,145,255,0.07)",
    sunCore: "rgba(208, 245, 255, 0.9)",
    sunHalo: "rgba(93, 136, 255, 0.46)",
    beam: "#6fc4ff",
    accent: "#78e9ff",
    accentWarm: "#7ca4ff",
    ember: "rgba(160, 223, 255, 0.08)",
  },
  survival: {
    skyTop: "#14060c",
    skyMid: "#3c1021",
    skyBottom: "#45121f",
    roadDark: "#241523",
    roadLight: "#372032",
    grassDark: "#241215",
    grassLight: "#351618",
    rumbleA: "#ff826d",
    rumbleB: "#ff4f92",
    laneGlow: "rgba(255, 124, 160, 0.16)",
    shoulder: "rgba(255, 198, 198, 0.08)",
    horizonGlow: "rgba(255,103,122,0.16)",
    horizonWarm: "rgba(255,199,108,0.09)",
    sunCore: "rgba(255, 180, 127, 0.95)",
    sunHalo: "rgba(255, 79, 146, 0.5)",
    beam: "#ff587a",
    accent: "#ff6d95",
    accentWarm: "#ffb86b",
    ember: "rgba(255, 146, 96, 0.1)",
  },
};

const SCENE_COLOR_KEYS = [
  "skyTop",
  "skyMid",
  "skyBottom",
  "roadDark",
  "roadLight",
  "grassDark",
  "grassLight",
  "rumbleA",
  "rumbleB",
  "laneGlow",
  "shoulder",
  "horizonGlow",
  "horizonWarm",
  "sunCore",
  "sunHalo",
  "beam",
  "accent",
  "accentWarm",
  "ember",
];

const DAY_NIGHT_SCENE_KEYS = [
  "mountainFar",
  "mountainNear",
  "cityTop",
  "cityBottom",
  "gridColor",
  "cloudTint",
  "moonCore",
  "moonHalo",
  "moonRing",
  "skyVignette",
  "haze",
];

const DAY_NIGHT_PHASES = [
  {
    name: "Day",
    mix: 0.62,
    skyTop: "#2d86ff",
    skyMid: "#86d8ff",
    skyBottom: "#ffe1a4",
    roadDark: "#22304a",
    roadLight: "#334766",
    grassDark: "#1d382f",
    grassLight: "#2a4f3f",
    rumbleA: "#93f2ff",
    rumbleB: "#ff92b4",
    laneGlow: "rgba(144, 233, 255, 0.11)",
    shoulder: "rgba(255, 255, 255, 0.12)",
    horizonGlow: "rgba(255, 241, 198, 0.18)",
    horizonWarm: "rgba(255, 205, 131, 0.13)",
    sunCore: "rgba(255, 248, 211, 0.98)",
    sunHalo: "rgba(255, 188, 99, 0.5)",
    beam: "#8cdcff",
    accent: "#8eefff",
    accentWarm: "#ffd88a",
    ember: "rgba(255, 216, 152, 0.08)",
    mountainFar: "#31577e",
    mountainNear: "#223a5d",
    cityTop: "rgba(43, 67, 104, 0.76)",
    cityBottom: "rgba(7, 15, 30, 0.9)",
    gridColor: "#89d7ff",
    cloudTint: "#fff4e0",
    moonCore: "rgba(225, 236, 255, 0.22)",
    moonHalo: "rgba(157, 204, 255, 0.08)",
    moonRing: "#cbe4ff",
    skyVignette: "rgba(255, 220, 162, 0.04)",
    haze: "rgba(255, 239, 200, 0.1)",
    starAlpha: 0.05,
    cloudAlpha: 0.92,
    auroraAlpha: 0.14,
    beamAlpha: 0.14,
    modeAtmosAlpha: 0.58,
    sunAlpha: 1,
    moonAlpha: 0,
    sunY: 0.26,
    sunRadius: 156,
    moonRadius: 68,
    lensAlpha: 1,
    floorAlpha: 0.18,
    gridAlpha: 0.08,
    mountainFarAlpha: 0.44,
    mountainNearAlpha: 0.58,
    cityWindowAlpha: 0.62,
    cityCoreAlpha: 0.14,
    bloomStrength: 0.94,
    glassStrength: 0.88,
  },
  {
    name: "Sunset",
    mix: 0.74,
    skyTop: "#1a164a",
    skyMid: "#8c3b6c",
    skyBottom: "#ff9954",
    roadDark: "#251d36",
    roadLight: "#3a2c4b",
    grassDark: "#2b201f",
    grassLight: "#4a2f2c",
    rumbleA: "#7cf4ff",
    rumbleB: "#ff7ea4",
    laneGlow: "rgba(255, 189, 124, 0.12)",
    shoulder: "rgba(255, 223, 196, 0.1)",
    horizonGlow: "rgba(255, 176, 109, 0.22)",
    horizonWarm: "rgba(255, 122, 95, 0.18)",
    sunCore: "rgba(255, 231, 185, 0.95)",
    sunHalo: "rgba(255, 133, 91, 0.56)",
    beam: "#ff9c76",
    accent: "#ffb682",
    accentWarm: "#ffd36d",
    ember: "rgba(255, 181, 104, 0.12)",
    mountainFar: "#452a55",
    mountainNear: "#2a2046",
    cityTop: "rgba(54, 35, 74, 0.82)",
    cityBottom: "rgba(7, 10, 22, 0.94)",
    gridColor: "#ff9d6d",
    cloudTint: "#ffd7be",
    moonCore: "rgba(229, 234, 255, 0.5)",
    moonHalo: "rgba(145, 139, 255, 0.18)",
    moonRing: "#e3d9ff",
    skyVignette: "rgba(54, 14, 41, 0.08)",
    haze: "rgba(255, 164, 109, 0.1)",
    starAlpha: 0.22,
    cloudAlpha: 0.78,
    auroraAlpha: 0.28,
    beamAlpha: 0.22,
    modeAtmosAlpha: 0.8,
    sunAlpha: 0.88,
    moonAlpha: 0.18,
    sunY: 0.32,
    sunRadius: 146,
    moonRadius: 72,
    lensAlpha: 0.82,
    floorAlpha: 0.2,
    gridAlpha: 0.12,
    mountainFarAlpha: 0.58,
    mountainNearAlpha: 0.72,
    cityWindowAlpha: 0.82,
    cityCoreAlpha: 0.18,
    bloomStrength: 1.06,
    glassStrength: 1,
  },
  {
    name: "Night",
    mix: 0.88,
    skyTop: "#020611",
    skyMid: "#091632",
    skyBottom: "#13234a",
    roadDark: "#0d1427",
    roadLight: "#16213d",
    grassDark: "#091713",
    grassLight: "#11231d",
    rumbleA: "#51cfff",
    rumbleB: "#7d8cff",
    laneGlow: "rgba(111, 205, 255, 0.12)",
    shoulder: "rgba(220, 240, 255, 0.05)",
    horizonGlow: "rgba(86, 144, 255, 0.18)",
    horizonWarm: "rgba(91, 114, 207, 0.08)",
    sunCore: "rgba(184, 208, 255, 0.24)",
    sunHalo: "rgba(76, 105, 255, 0.16)",
    beam: "#6db3ff",
    accent: "#82d8ff",
    accentWarm: "#a7b7ff",
    ember: "rgba(126, 149, 255, 0.08)",
    mountainFar: "#0f2040",
    mountainNear: "#16294e",
    cityTop: "rgba(15, 29, 57, 0.9)",
    cityBottom: "rgba(3, 7, 17, 0.98)",
    gridColor: "#72baff",
    cloudTint: "#b7caff",
    moonCore: "rgba(239, 245, 255, 0.98)",
    moonHalo: "rgba(126, 166, 255, 0.28)",
    moonRing: "#c8dcff",
    skyVignette: "rgba(23, 35, 74, 0.12)",
    haze: "rgba(61, 92, 178, 0.08)",
    starAlpha: 0.92,
    cloudAlpha: 0.38,
    auroraAlpha: 0.62,
    beamAlpha: 0.34,
    modeAtmosAlpha: 1,
    sunAlpha: 0.08,
    moonAlpha: 1,
    sunY: 0.4,
    sunRadius: 120,
    moonRadius: 82,
    lensAlpha: 0.24,
    floorAlpha: 0.11,
    gridAlpha: 0.14,
    mountainFarAlpha: 0.72,
    mountainNearAlpha: 0.84,
    cityWindowAlpha: 1,
    cityCoreAlpha: 0.24,
    bloomStrength: 1.12,
    glassStrength: 1.08,
  },
];

const state = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: 1,
  lastFrame: 0,
  started: false,
  paused: false,
  finished: false,
  raceClock: 0,
  lastLapTime: null,
  lapStartClock: 0,
  completedLaps: 0,
  position: 0,
  speed: 0,
  playerX: 0,
  steering: 0,
  nitro: 100,
  integrity: 100,
  shake: 0,
  flash: 0,
  countdown: 3.4,
  boostActive: false,
  toastUntil: 0,
  score: 0,
  combo: 1,
  comboTimer: 0,
  comboMax: 2.8,
  zoneName: "Open Desert",
  selectedMode: "classic",
  modeTimeRemaining: 0,
  modeRecord: readModeRecord("classic"),
  overlayScreen: OVERLAY_SCREENS.menu,
  settingsReturnScreen: OVERLAY_SCREENS.menu,
  overlaySnapshot: null,
  settings: readSettings(),
  visualClock: 0,
  sceneCache: null,
};

const input = {
  left: false,
  right: false,
  accelerate: false,
  brake: false,
  boost: false,
  drift: false,
  horn: false,
};

const audio = {
  enabled: true,
  initialized: false,
  running: false,
  bpm: 124,
  step: 0,
  nextStepTime: 0,
  scheduleAhead: 0.18,
  ctx: null,
  master: null,
  musicBus: null,
  drumBus: null,
  fxBus: null,
  toneFilter: null,
  noiseBuffer: null,
  hornGain: null,
  hornOscillators: [],
  hornFilter: null,
  hornLfo: null,
  hornLfoGain: null,
  hornActive: false,
};

const activeTouchInputs = new Map();

const track = [];
const traffic = [];
const pickups = [];
const particles = [];
const stars = [];
const clouds = [];
let trackLength = 0;

init();

function init() {
  buildTrack();
  seedTraffic();
  seedPickups();
  seedStars();
  seedClouds();
  resize();
  applySettingsToUi();
  applyModePresentation();
  syncStatusLine();
  updateMusicButton();
  updateHudButtons();
  bindEvents();
  requestAnimationFrame(frame);
}

function currentMode() {
  return MODES[state.selectedMode];
}

function scenePalette() {
  if (state.sceneCache) {
    return state.sceneCache;
  }

  const base = SCENE_PALETTES[state.selectedMode] || SCENE_PALETTES.classic;
  const cycle = state.settings.dayNightCycle
    ? getDayNightCycle()
    : { from: DAY_NIGHT_PHASES[1], to: DAY_NIGHT_PHASES[1], blend: 0 };
  const fromScene = applyDayNightPhase(base, cycle.from);
  const toScene = applyDayNightPhase(base, cycle.to);
  const scene = {};

  for (const key of SCENE_COLOR_KEYS) {
    scene[key] = mixColor(fromScene[key], toScene[key], cycle.blend);
  }

  for (const key of DAY_NIGHT_SCENE_KEYS) {
    scene[key] = mixColor(fromScene[key], toScene[key], cycle.blend);
  }

  scene.phaseName = cycle.blend < 0.5 ? cycle.from.name : cycle.to.name;
  scene.starAlpha = lerp(fromScene.starAlpha, toScene.starAlpha, cycle.blend);
  scene.cloudAlpha = lerp(fromScene.cloudAlpha, toScene.cloudAlpha, cycle.blend);
  scene.auroraAlpha = lerp(fromScene.auroraAlpha, toScene.auroraAlpha, cycle.blend);
  scene.beamAlpha = lerp(fromScene.beamAlpha, toScene.beamAlpha, cycle.blend);
  scene.modeAtmosAlpha = lerp(fromScene.modeAtmosAlpha, toScene.modeAtmosAlpha, cycle.blend);
  scene.sunAlpha = lerp(fromScene.sunAlpha, toScene.sunAlpha, cycle.blend);
  scene.moonAlpha = lerp(fromScene.moonAlpha, toScene.moonAlpha, cycle.blend);
  scene.sunY = lerp(fromScene.sunY, toScene.sunY, cycle.blend);
  scene.sunRadius = lerp(fromScene.sunRadius, toScene.sunRadius, cycle.blend);
  scene.moonRadius = lerp(fromScene.moonRadius, toScene.moonRadius, cycle.blend);
  scene.lensAlpha = lerp(fromScene.lensAlpha, toScene.lensAlpha, cycle.blend);
  scene.floorAlpha = lerp(fromScene.floorAlpha, toScene.floorAlpha, cycle.blend);
  scene.gridAlpha = lerp(fromScene.gridAlpha, toScene.gridAlpha, cycle.blend);
  scene.mountainFarAlpha = lerp(fromScene.mountainFarAlpha, toScene.mountainFarAlpha, cycle.blend);
  scene.mountainNearAlpha = lerp(fromScene.mountainNearAlpha, toScene.mountainNearAlpha, cycle.blend);
  scene.cityWindowAlpha = lerp(fromScene.cityWindowAlpha, toScene.cityWindowAlpha, cycle.blend);
  scene.cityCoreAlpha = lerp(fromScene.cityCoreAlpha, toScene.cityCoreAlpha, cycle.blend);
  scene.bloomStrength = lerp(fromScene.bloomStrength, toScene.bloomStrength, cycle.blend);
  scene.glassStrength = lerp(fromScene.glassStrength, toScene.glassStrength, cycle.blend);

  state.sceneCache = scene;
  return scene;
}

function readSettings() {
  const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!raw) {
    return sanitizeSettings(DEFAULT_SETTINGS);
  }

  try {
    const parsed = JSON.parse(raw);
    return sanitizeSettings({
      ...DEFAULT_SETTINGS,
      ...parsed,
    });
  } catch {
    return sanitizeSettings(DEFAULT_SETTINGS);
  }
}

function writeSettings() {
  const sanitized = sanitizeSettings(state.settings);
  state.settings = sanitized;
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(sanitized));
}

function applySettingsToUi() {
  ui.trafficDensityInput.value = String(state.settings.trafficDensity);
  ui.trafficDensityValue.textContent = `${state.settings.trafficDensity}%`;
  ui.cameraShakeInput.checked = Boolean(state.settings.cameraShake);
  ui.cameraShakeValue.textContent = state.settings.cameraShake ? "On" : "Off";
  ui.dayNightCycleInput.checked = Boolean(state.settings.dayNightCycle);
  ui.dayNightCycleValue.textContent = state.settings.dayNightCycle ? "On" : "Off";
  ui.touchControlsInput.checked = Boolean(state.settings.touchControls);
  ui.touchControlsValue.textContent = state.settings.touchControls ? "On" : "Off";
  document.body.classList.toggle("hide-touch-controls", !state.settings.touchControls);
}

function updateSetting(key, value) {
  state.settings[key] = value;
  state.settings = sanitizeSettings(state.settings);
  applySettingsToUi();
  writeSettings();
  if (key === "dayNightCycle") {
    state.sceneCache = null;
  }
  if (key === "touchControls" && !value) {
    clearTouchInputs();
  }
}

function sanitizeSettings(settings) {
  const source = settings || DEFAULT_SETTINGS;
  return {
    trafficDensity: clamp(Number(source.trafficDensity) || DEFAULT_SETTINGS.trafficDensity, 70, 130),
    cameraShake: source.cameraShake === false ? false : Boolean(source.cameraShake),
    dayNightCycle: source.dayNightCycle === false ? false : Boolean(source.dayNightCycle),
    touchControls: source.touchControls === false ? false : Boolean(source.touchControls),
  };
}

function getDayNightCycle() {
  const phaseDuration = 18;
  const cyclePosition = state.visualClock / phaseDuration;
  const baseIndex = Math.floor(cyclePosition) % DAY_NIGHT_PHASES.length;
  const nextIndex = (baseIndex + 1) % DAY_NIGHT_PHASES.length;
  const blend = easeInOut(0, 1, cyclePosition - Math.floor(cyclePosition));

  return {
    from: DAY_NIGHT_PHASES[baseIndex],
    to: DAY_NIGHT_PHASES[nextIndex],
    blend,
  };
}

function applyDayNightPhase(base, phase) {
  const scene = {};

  for (const key of SCENE_COLOR_KEYS) {
    scene[key] = mixColor(base[key], phase[key], phase.mix);
  }

  for (const key of DAY_NIGHT_SCENE_KEYS) {
    scene[key] = phase[key];
  }

  scene.starAlpha = phase.starAlpha;
  scene.cloudAlpha = phase.cloudAlpha;
  scene.auroraAlpha = phase.auroraAlpha;
  scene.beamAlpha = phase.beamAlpha;
  scene.modeAtmosAlpha = phase.modeAtmosAlpha;
  scene.sunAlpha = phase.sunAlpha;
  scene.moonAlpha = phase.moonAlpha;
  scene.sunY = phase.sunY;
  scene.sunRadius = phase.sunRadius;
  scene.moonRadius = phase.moonRadius;
  scene.lensAlpha = phase.lensAlpha;
  scene.floorAlpha = phase.floorAlpha;
  scene.gridAlpha = phase.gridAlpha;
  scene.mountainFarAlpha = phase.mountainFarAlpha;
  scene.mountainNearAlpha = phase.mountainNearAlpha;
  scene.cityWindowAlpha = phase.cityWindowAlpha;
  scene.cityCoreAlpha = phase.cityCoreAlpha;
  scene.bloomStrength = phase.bloomStrength;
  scene.glassStrength = phase.glassStrength;
  return scene;
}

function readModeRecord(modeId) {
  const raw = localStorage.getItem(`${STORAGE_PREFIX}${modeId}`);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeModeRecord(modeId, record) {
  localStorage.setItem(`${STORAGE_PREFIX}${modeId}`, JSON.stringify(record));
  if (state.selectedMode === modeId) {
    state.modeRecord = record;
  }
}

function selectMode(modeId) {
  if (!MODES[modeId]) {
    return;
  }

  state.selectedMode = modeId;
  state.modeRecord = readModeRecord(modeId);
  applyModePresentation();
  syncStatusLine();
}

function applyModePresentation() {
  const mode = currentMode();
  DEFAULT_OVERLAY.eyebrow = mode.overlayEyebrow;
  DEFAULT_OVERLAY.title = mode.overlayTitle;
  DEFAULT_OVERLAY.copy = mode.overlayCopy;
  ui.modeSubcopy.textContent = mode.subtitle;

  for (const button of ui.modeButtons) {
    button.classList.toggle("active", button.dataset.mode === state.selectedMode);
  }

  if (ui.overlay.classList.contains("visible")) {
    refreshOverlayScreen();
  }
}

function setOverlayContent(eyebrow, title, copy) {
  ui.overlayEyebrow.textContent = eyebrow;
  ui.overlayTitle.textContent = title;
  ui.overlayCopy.textContent = copy;
}

function rememberOverlayContent(eyebrow, title, copy) {
  state.overlaySnapshot = { eyebrow, title, copy };
  setOverlayContent(eyebrow, title, copy);
}

function resetOverlayContent() {
  rememberOverlayContent(DEFAULT_OVERLAY.eyebrow, DEFAULT_OVERLAY.title, DEFAULT_OVERLAY.copy);
}

function setButtonVisibility(button, visible, label) {
  button.classList.toggle("hidden", !visible);
  if (label) {
    button.textContent = label;
  }
}

function refreshOverlayScreen() {
  const hasActiveRun = state.started && !state.finished;
  ui.menuPanel.classList.toggle("hidden", state.overlayScreen !== OVERLAY_SCREENS.menu);
  ui.settingsPanel.classList.toggle("hidden", state.overlayScreen !== OVERLAY_SCREENS.settings);

  switch (state.overlayScreen) {
    case OVERLAY_SCREENS.menu:
      if (hasActiveRun) {
        setOverlayContent(
          "Main Menu",
          "Run Parked",
          "Choose a mode, change your setup, resume the current run, or restart clean from the grid.",
        );
      } else {
        resetOverlayContent();
      }
      setButtonVisibility(ui.startButton, true, hasActiveRun ? "Restart Race" : "Launch Race");
      setButtonVisibility(ui.resumeButton, hasActiveRun, "Resume");
      setButtonVisibility(ui.restartButton, false, "Run Again");
      setButtonVisibility(ui.openSettingsButton, true, "Settings");
      setButtonVisibility(ui.backButton, false, "Back");
      setButtonVisibility(ui.mainMenuButton, false, "Main Menu");
      break;
    case OVERLAY_SCREENS.settings:
      setOverlayContent(
        "Systems",
        "Settings",
        "Tune traffic, camera behavior, visuals, and touch controls before the next push.",
      );
      setButtonVisibility(ui.startButton, false, "Launch Race");
      setButtonVisibility(ui.resumeButton, false, "Resume");
      setButtonVisibility(ui.restartButton, false, "Run Again");
      setButtonVisibility(ui.openSettingsButton, false, "Settings");
      setButtonVisibility(ui.backButton, true, "Back");
      setButtonVisibility(ui.mainMenuButton, state.settingsReturnScreen !== OVERLAY_SCREENS.menu, "Main Menu");
      break;
    case OVERLAY_SCREENS.pause:
      setOverlayContent(
        "Run Frozen",
        "Race Paused",
        "Take a breath, tweak your settings, or jump straight back into the race.",
      );
      setButtonVisibility(ui.startButton, false, "Launch Race");
      setButtonVisibility(ui.resumeButton, true, "Resume");
      setButtonVisibility(ui.restartButton, true, "Run Again");
      setButtonVisibility(ui.openSettingsButton, true, "Settings");
      setButtonVisibility(ui.backButton, false, "Back");
      setButtonVisibility(ui.mainMenuButton, true, "Main Menu");
      break;
    case OVERLAY_SCREENS.gameover:
      if (state.overlaySnapshot) {
        setOverlayContent(state.overlaySnapshot.eyebrow, state.overlaySnapshot.title, state.overlaySnapshot.copy);
      }
      setButtonVisibility(ui.startButton, false, "Launch Race");
      setButtonVisibility(ui.resumeButton, false, "Resume");
      setButtonVisibility(ui.restartButton, true, "Run Again");
      setButtonVisibility(ui.openSettingsButton, true, "Settings");
      setButtonVisibility(ui.backButton, false, "Back");
      setButtonVisibility(ui.mainMenuButton, true, "Main Menu");
      break;
    case OVERLAY_SCREENS.finish:
      if (state.overlaySnapshot) {
        setOverlayContent(state.overlaySnapshot.eyebrow, state.overlaySnapshot.title, state.overlaySnapshot.copy);
      }
      setButtonVisibility(ui.startButton, false, "Launch Race");
      setButtonVisibility(ui.resumeButton, false, "Resume");
      setButtonVisibility(ui.restartButton, true, "Run Again");
      setButtonVisibility(ui.openSettingsButton, true, "Settings");
      setButtonVisibility(ui.backButton, false, "Back");
      setButtonVisibility(ui.mainMenuButton, true, "Main Menu");
      break;
    default:
      break;
  }
}

function showOverlayScreen(screen) {
  state.overlayScreen = screen;
  ui.overlay.classList.add("visible");
  refreshOverlayScreen();
  updateHudButtons();
}

function hideOverlay() {
  ui.overlay.classList.remove("visible");
  updateHudButtons();
}

function openMainMenu() {
  clearTouchInputs();
  if (state.started && !state.finished) {
    state.paused = true;
  }
  showOverlayScreen(OVERLAY_SCREENS.menu);
}

function openSettings() {
  state.settingsReturnScreen = state.overlayScreen;
  showOverlayScreen(OVERLAY_SCREENS.settings);
}

function closeSettings() {
  const returnScreen = state.settingsReturnScreen || OVERLAY_SCREENS.menu;
  showOverlayScreen(returnScreen);
}

function openPauseScreen() {
  if (!state.started || state.finished) {
    return;
  }
  clearTouchInputs();
  state.paused = true;
  showOverlayScreen(OVERLAY_SCREENS.pause);
  showToast("Paused");
}

function resumeRace() {
  if (!state.started || state.finished) {
    return;
  }
  state.paused = false;
  hideOverlay();
  showToast("Resume");
}

function updateHudButtons() {
  const playableRun = state.started && !state.finished;
  ui.pauseHudButton.disabled = !playableRun;
  ui.pauseHudButton.textContent = playableRun && state.paused && state.overlayScreen === OVERLAY_SCREENS.pause ? "Resume" : "Pause";
}

function ensureAudio() {
  if (audio.initialized) {
    return true;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    ui.musicButton.disabled = true;
    ui.musicButton.textContent = "Music: N/A";
    return false;
  }

  audio.ctx = new AudioContextClass();
  audio.master = audio.ctx.createGain();
  audio.musicBus = audio.ctx.createGain();
  audio.drumBus = audio.ctx.createGain();
  audio.fxBus = audio.ctx.createGain();
  audio.toneFilter = audio.ctx.createBiquadFilter();
  audio.toneFilter.type = "lowpass";
  audio.toneFilter.frequency.value = 1600;
  audio.toneFilter.Q.value = 1.8;
  audio.musicBus.gain.value = 0.34;
  audio.drumBus.gain.value = 0.28;
  audio.fxBus.gain.value = 0.22;
  audio.master.gain.value = 0.0001;

  audio.musicBus.connect(audio.toneFilter);
  audio.toneFilter.connect(audio.master);
  audio.drumBus.connect(audio.master);
  audio.master.connect(audio.ctx.destination);
  audio.fxBus.connect(audio.ctx.destination);
  audio.noiseBuffer = createNoiseBuffer(audio.ctx);
  audio.initialized = true;
  updateMusicButton();
  return true;
}

function createNoiseBuffer(audioContext) {
  const buffer = audioContext.createBuffer(1, audioContext.sampleRate, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function bootMusic() {
  if (!ensureAudio()) {
    return;
  }

  audio.ctx.resume();
  if (!audio.enabled) {
    return;
  }

  if (!audio.running) {
    audio.running = true;
    audio.nextStepTime = audio.ctx.currentTime + 0.05;
  }

  audio.master.gain.setTargetAtTime(0.46, audio.ctx.currentTime, 0.18);
}

function toggleMusic() {
  if (!ensureAudio()) {
    return;
  }

  audio.enabled = !audio.enabled;

  if (audio.enabled) {
    audio.ctx.resume();
    audio.running = true;
    audio.nextStepTime = audio.ctx.currentTime + 0.05;
    audio.master.gain.setTargetAtTime(0.46, audio.ctx.currentTime, 0.15);
    showToast("Music On");
  } else {
    audio.master.gain.setTargetAtTime(0.0001, audio.ctx.currentTime, 0.08);
    showToast("Music Off");
  }

  updateMusicButton();
}

function updateMusicButton() {
  if (!ui.musicButton) {
    return;
  }

  ui.musicButton.textContent = `Music: ${audio.enabled ? "On" : "Off"}`;
}

function startHorn() {
  if (audio.hornActive) {
    return;
  }

  if (!ensureAudio()) {
    return;
  }

  audio.ctx.resume();
  const now = audio.ctx.currentTime;
  const hornFilter = audio.ctx.createBiquadFilter();
  const hornGain = audio.ctx.createGain();
  const vibrato = audio.ctx.createOscillator();
  const vibratoGain = audio.ctx.createGain();
  const root = midiToFreq(66);
  const intervals = [0, 3];

  hornFilter.type = "bandpass";
  hornFilter.frequency.value = 720;
  hornFilter.Q.value = 0.7;
  hornGain.gain.setValueAtTime(0.0001, now);
  hornGain.gain.exponentialRampToValueAtTime(0.17, now + 0.04);

  vibrato.type = "sine";
  vibrato.frequency.value = 5.4;
  vibratoGain.gain.value = 8;
  vibrato.connect(vibratoGain);
  vibrato.start(now);

  audio.hornOscillators = intervals.map((interval, index) => {
    const osc = audio.ctx.createOscillator();
    osc.type = index === 0 ? "sawtooth" : "square";
    osc.frequency.setValueAtTime(root * Math.pow(2, interval / 12), now);
    osc.detune.value = index === 0 ? -4 : 4;
    vibratoGain.connect(osc.detune);
    osc.connect(hornFilter);
    osc.start(now);
    return osc;
  });

  hornFilter.connect(hornGain);
  hornGain.connect(audio.fxBus);
  audio.hornFilter = hornFilter;
  audio.hornGain = hornGain;
  audio.hornLfo = vibrato;
  audio.hornLfoGain = vibratoGain;
  audio.hornActive = true;
}

function stopHorn() {
  if (!audio.hornActive || !audio.ctx) {
    input.horn = false;
    return;
  }

  const now = audio.ctx.currentTime;
  const hornGain = audio.hornGain;
  const hornFilter = audio.hornFilter;
  const hornLfo = audio.hornLfo;
  const hornLfoGain = audio.hornLfoGain;
  const hornOscillators = [...audio.hornOscillators];
  if (audio.hornGain) {
    audio.hornGain.gain.cancelScheduledValues(now);
    audio.hornGain.gain.setValueAtTime(Math.max(audio.hornGain.gain.value, 0.0001), now);
    audio.hornGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
  }

  for (const osc of hornOscillators) {
    try {
      osc.stop(now + 0.09);
    } catch {
      // Ignore already-stopped oscillators.
    }
  }

  if (hornLfo) {
    try {
      hornLfo.stop(now + 0.09);
    } catch {
      // Ignore already-stopped oscillators.
    }
  }

  audio.hornOscillators = [];
  audio.hornGain = null;
  audio.hornFilter = null;
  audio.hornLfo = null;
  audio.hornLfoGain = null;
  audio.hornActive = false;
  input.horn = false;

  window.setTimeout(() => {
    try {
      hornLfoGain?.disconnect();
    } catch {
      // Ignore disconnect errors from already-disconnected nodes.
    }
    try {
      hornFilter?.disconnect();
    } catch {
      // Ignore disconnect errors from already-disconnected nodes.
    }
    try {
      hornGain?.disconnect();
    } catch {
      // Ignore disconnect errors from already-disconnected nodes.
    }
  }, 140);
}

function updateMusic() {
  if (!audio.initialized || !audio.enabled || !audio.running || audio.ctx.state === "suspended") {
    return;
  }

  const now = audio.ctx.currentTime;
  const drive = clamp(state.speed / config.maxSpeed, 0, 1);
  const comboBoost = clamp((state.combo - 1) / 7, 0, 1);
  const pausedDamp = state.paused ? 0.18 : 1;
  const finishDamp = state.finished ? 0.55 : 1;
  const masterTarget = 0.18 + drive * 0.24 + comboBoost * 0.1;
  const cutoffTarget = 900 + drive * 2200 + comboBoost * 1200 + (state.boostActive ? 900 : 0);

  audio.master.gain.setTargetAtTime(masterTarget * pausedDamp * finishDamp, now, 0.2);
  audio.musicBus.gain.setTargetAtTime(0.28 + drive * 0.12, now, 0.2);
  audio.drumBus.gain.setTargetAtTime(0.22 + drive * 0.1, now, 0.2);
  audio.toneFilter.frequency.setTargetAtTime(cutoffTarget, now, 0.12);

  while (audio.nextStepTime < now + audio.scheduleAhead) {
    scheduleMusicStep(audio.nextStepTime, audio.step);
    audio.nextStepTime += 60 / audio.bpm / 4;
    audio.step = (audio.step + 1) % 64;
  }
}

function scheduleMusicStep(time, step) {
  const bar = Math.floor(step / 16) % 4;
  const stepInBar = step % 16;
  const roots = [45, 48, 50, 43];
  const root = roots[bar];
  const intensity = clamp(state.speed / config.maxSpeed, 0.2, 1);
  const comboBoost = clamp((state.combo - 1) / 7, 0, 1);

  if (stepInBar % 4 === 0) {
    playBass(time, midiToFreq(root - 12), intensity);
  }

  if (stepInBar === 0 || stepInBar === 8) {
    playPad(time, [root, root + 7, root + 12], 0.8 + comboBoost * 0.5);
  }

  if (stepInBar % 2 === 0) {
    const arpPattern = [0, 7, 12, 7, 3, 10, 12, 10];
    const interval = arpPattern[(stepInBar / 2) % arpPattern.length];
    playLead(time, midiToFreq(root + interval + 12), intensity + comboBoost * 0.4);
  }

  if (stepInBar === 0 || stepInBar === 6 || stepInBar === 8 || stepInBar === 14) {
    playKick(time, 0.75 + intensity * 0.25);
  }

  if (stepInBar === 4 || stepInBar === 12) {
    playSnare(time, 0.6 + comboBoost * 0.35);
  }

  if (stepInBar % 2 === 1) {
    playHat(time, 0.24 + intensity * 0.18);
  }
}

function playBass(time, frequency, intensity) {
  const osc = audio.ctx.createOscillator();
  const sub = audio.ctx.createOscillator();
  const gain = audio.ctx.createGain();
  const filter = audio.ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 240 + intensity * 180;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.18 + intensity * 0.08, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.34);
  osc.type = "sawtooth";
  sub.type = "triangle";
  osc.frequency.setValueAtTime(frequency, time);
  sub.frequency.setValueAtTime(frequency * 0.5, time);
  osc.connect(filter);
  sub.connect(filter);
  filter.connect(gain);
  gain.connect(audio.musicBus);
  osc.start(time);
  sub.start(time);
  osc.stop(time + 0.38);
  sub.stop(time + 0.38);
}

function playLead(time, frequency, intensity) {
  const osc = audio.ctx.createOscillator();
  const lfo = audio.ctx.createOscillator();
  const lfoGain = audio.ctx.createGain();
  const gain = audio.ctx.createGain();
  const filter = audio.ctx.createBiquadFilter();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(frequency, time);
  filter.type = "bandpass";
  filter.frequency.value = 1000 + intensity * 700;
  filter.Q.value = 1.4;
  lfo.frequency.value = 5.2;
  lfoGain.gain.value = 8;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.045 + intensity * 0.04, time + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audio.musicBus);
  osc.start(time);
  lfo.start(time);
  osc.stop(time + 0.22);
  lfo.stop(time + 0.22);
}

function playPad(time, midiNotes, intensity) {
  for (const midi of midiNotes) {
    const osc = audio.ctx.createOscillator();
    const gain = audio.ctx.createGain();
    const filter = audio.ctx.createBiquadFilter();
    osc.type = "sine";
    osc.frequency.setValueAtTime(midiToFreq(midi), time);
    filter.type = "lowpass";
    filter.frequency.value = 700 + intensity * 180;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.028 + intensity * 0.012, time + 0.22);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.82);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audio.musicBus);
    osc.start(time);
    osc.stop(time + 0.9);
  }
}

function playKick(time, intensity) {
  const osc = audio.ctx.createOscillator();
  const gain = audio.ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(132, time);
  osc.frequency.exponentialRampToValueAtTime(42, time + 0.18);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.52 * intensity, time + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);
  osc.connect(gain);
  gain.connect(audio.drumBus);
  osc.start(time);
  osc.stop(time + 0.22);
}

function playSnare(time, intensity) {
  const noise = audio.ctx.createBufferSource();
  const noiseFilter = audio.ctx.createBiquadFilter();
  const noiseGain = audio.ctx.createGain();
  const tone = audio.ctx.createOscillator();
  const toneGain = audio.ctx.createGain();
  noise.buffer = audio.noiseBuffer;
  noiseFilter.type = "highpass";
  noiseFilter.frequency.value = 1600;
  noiseGain.gain.setValueAtTime(0.0001, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.22 * intensity, time + 0.005);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);
  tone.type = "triangle";
  tone.frequency.setValueAtTime(180, time);
  toneGain.gain.setValueAtTime(0.0001, time);
  toneGain.gain.exponentialRampToValueAtTime(0.08 * intensity, time + 0.005);
  toneGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(audio.drumBus);
  tone.connect(toneGain);
  toneGain.connect(audio.drumBus);
  noise.start(time);
  noise.stop(time + 0.18);
  tone.start(time);
  tone.stop(time + 0.14);
}

function playHat(time, intensity) {
  const noise = audio.ctx.createBufferSource();
  const filter = audio.ctx.createBiquadFilter();
  const gain = audio.ctx.createGain();
  noise.buffer = audio.noiseBuffer;
  filter.type = "highpass";
  filter.frequency.value = 6800;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(intensity, time + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audio.drumBus);
  noise.start(time);
  noise.stop(time + 0.06);
}

function midiToFreq(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

function bindEvents() {
  window.addEventListener("resize", resize);

  window.addEventListener("keydown", (event) => {
    switch (event.code) {
      case "ArrowLeft":
      case "KeyA":
        input.left = true;
        break;
      case "ArrowRight":
      case "KeyD":
        input.right = true;
        break;
      case "ArrowUp":
      case "KeyW":
        input.accelerate = true;
        break;
      case "ArrowDown":
      case "KeyS":
        input.brake = true;
        break;
      case "Space":
        input.boost = true;
        event.preventDefault();
        break;
      case "ShiftLeft":
      case "ShiftRight":
        input.drift = true;
        break;
      case "KeyQ":
        if (!input.horn) {
          input.horn = true;
          startHorn();
        }
        break;
      case "KeyP":
        if (state.started && !state.finished) {
          if (state.paused && state.overlayScreen === OVERLAY_SCREENS.pause) {
            resumeRace();
          } else {
            openPauseScreen();
          }
        }
        break;
      default:
        break;
    }
  });

  window.addEventListener("keyup", (event) => {
    switch (event.code) {
      case "ArrowLeft":
      case "KeyA":
        input.left = false;
        break;
      case "ArrowRight":
      case "KeyD":
        input.right = false;
        break;
      case "ArrowUp":
      case "KeyW":
        input.accelerate = false;
        break;
      case "ArrowDown":
      case "KeyS":
        input.brake = false;
        break;
      case "Space":
        input.boost = false;
        break;
      case "ShiftLeft":
      case "ShiftRight":
        input.drift = false;
        break;
      case "KeyQ":
        input.horn = false;
        stopHorn();
        break;
      default:
        break;
    }
  });

  window.addEventListener("blur", () => {
    clearTouchInputs();
    stopHorn();
  });
  window.addEventListener("pointerup", (event) => releaseTouchInput(event.pointerId));
  window.addEventListener("pointercancel", (event) => releaseTouchInput(event.pointerId));

  ui.startButton.addEventListener("click", startRace);
  ui.resumeButton.addEventListener("click", resumeRace);
  ui.restartButton.addEventListener("click", startRace);
  ui.openSettingsButton.addEventListener("click", openSettings);
  ui.backButton.addEventListener("click", closeSettings);
  ui.mainMenuButton.addEventListener("click", openMainMenu);
  ui.musicButton.addEventListener("click", toggleMusic);
  ui.pauseHudButton.addEventListener("click", () => {
    if (state.paused && state.overlayScreen === OVERLAY_SCREENS.pause) {
      resumeRace();
      return;
    }
    openPauseScreen();
  });
  ui.menuHudButton.addEventListener("click", openMainMenu);
  ui.settingsHudButton.addEventListener("click", () => {
    if (!ui.overlay.classList.contains("visible")) {
      state.paused = state.started && !state.finished;
      showOverlayScreen(state.paused ? OVERLAY_SCREENS.pause : OVERLAY_SCREENS.menu);
    }
    openSettings();
  });
  for (const button of ui.modeButtons) {
    button.addEventListener("click", () => selectMode(button.dataset.mode));
  }
  ui.trafficDensityInput.addEventListener("input", () => {
    updateSetting("trafficDensity", Number(ui.trafficDensityInput.value));
  });
  ui.cameraShakeInput.addEventListener("change", () => {
    updateSetting("cameraShake", ui.cameraShakeInput.checked);
  });
  ui.dayNightCycleInput.addEventListener("change", () => {
    updateSetting("dayNightCycle", ui.dayNightCycleInput.checked);
  });
  ui.touchControlsInput.addEventListener("change", () => {
    updateSetting("touchControls", ui.touchControlsInput.checked);
  });

  for (const button of ui.touchButtons) {
    button.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      event.preventDefault();
      const action = button.dataset.touchInput;
      if (!action) {
        return;
      }

      activeTouchInputs.set(event.pointerId, action);
      input[action] = true;
      button.classList.add("active");
      if (action === "horn") {
        startHorn();
      }
    });

    button.addEventListener("pointerleave", (event) => {
      if (event.pointerType !== "mouse") {
        return;
      }
      releaseTouchInput(event.pointerId);
    });

    button.addEventListener("lostpointercapture", (event) => releaseTouchInput(event.pointerId));
    button.addEventListener("contextmenu", (event) => event.preventDefault());
  }
}

function clearTouchInputs() {
  activeTouchInputs.clear();
  for (const button of ui.touchButtons) {
    button.classList.remove("active");
  }
  input.left = false;
  input.right = false;
  input.accelerate = false;
  input.brake = false;
  input.boost = false;
  input.drift = false;
  input.horn = false;
  stopHorn();
}

function releaseTouchInput(pointerId) {
  const action = activeTouchInputs.get(pointerId);
  if (!action) {
    return;
  }

  activeTouchInputs.delete(pointerId);

  const hasAnotherPointerForAction = [...activeTouchInputs.values()].some((value) => value === action);
  if (!hasAnotherPointerForAction) {
    input[action] = false;
    if (action === "horn") {
      stopHorn();
    }
  }

  for (const button of ui.touchButtons) {
    if (button.dataset.touchInput !== action) {
      continue;
    }

    const stillPressed = [...activeTouchInputs.values()].some((value) => value === action);
    button.classList.toggle("active", stillPressed);
  }
}

function resize() {
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  state.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(state.width * state.pixelRatio);
  canvas.height = Math.floor(state.height * state.pixelRatio);
  canvas.style.width = `${state.width}px`;
  canvas.style.height = `${state.height}px`;
}

function buildTrack() {
  track.length = 0;

  addStraight(70);
  addRoad(25, 40, 25, 0.2, 0);
  addRoad(30, 90, 30, 0.72, 0);
  addRoad(22, 45, 22, -0.95, 26);
  addStraight(50, 28);
  addRoad(35, 70, 35, 0.08, 76);
  addRoad(35, 88, 35, 1.16, -52);
  addRoad(22, 50, 22, -1.2, 0);
  addStraight(48);
  addRoad(16, 42, 16, 0.0, -82);
  addRoad(28, 64, 28, 0.92, 16);
  addRoad(18, 30, 18, -0.42, 38);
  addRoad(30, 80, 30, -1.34, 0);
  addStraight(64, -12);
  addRoad(24, 54, 24, 0.52, 18);
  addRoad(26, 56, 26, 0.0, 94);
  addRoad(18, 44, 18, 1.08, -74);
  addRoad(34, 70, 34, -0.72, 0);
  addStraight(80);

  trackLength = track.length * config.segmentLength;
  decorateTrack();
}

function addStraight(length, hill = 0) {
  addRoad(length, length, length, 0, hill);
}

function addRoad(enter, hold, leave, curve, hill) {
  const startY = lastY();
  const endY = startY + hill * config.segmentLength;
  const total = enter + hold + leave;

  for (let n = 0; n < enter; n += 1) {
    addSegment(easeIn(0, curve, n / Math.max(enter, 1)), easeInOut(startY, endY, n / total));
  }

  for (let n = 0; n < hold; n += 1) {
    addSegment(curve, easeInOut(startY, endY, (enter + n) / total));
  }

  for (let n = 0; n < leave; n += 1) {
    addSegment(easeInOut(curve, 0, n / Math.max(leave, 1)), easeInOut(startY, endY, (enter + hold + n) / total));
  }
}

function addSegment(curve, y) {
  const index = track.length;
  track.push({
    index,
    curve,
    colorBand: Math.floor(index / config.rumbleLength) % 2,
    p1: {
      world: { x: 0, y: lastY(), z: index * config.segmentLength },
      camera: { x: 0, y: 0, z: 0 },
      screen: { x: 0, y: 0, w: 0, scale: 0 },
    },
    p2: {
      world: { x: 0, y, z: (index + 1) * config.segmentLength },
      camera: { x: 0, y: 0, z: 0 },
      screen: { x: 0, y: 0, w: 0, scale: 0 },
    },
    cars: [],
    pickups: [],
    decorSeed: Math.random(),
    billboardText: "",
  });
}

function lastY() {
  if (!track.length) {
    return 0;
  }
  return track[track.length - 1].p2.world.y;
}

function seedTraffic() {
  traffic.length = 0;
  const carColors = ["#67f8ff", "#ffd867", "#ff6ea0", "#82ffb8", "#b994ff", "#ffffff"];
  const mode = currentMode();
  const trafficCount = Math.max(10, Math.round(mode.trafficCount * (state.settings.trafficDensity / 100)));

  for (let i = 0; i < trafficCount; i += 1) {
    traffic.push({
      offset: lerp(-0.8, 0.8, Math.random()),
      z: Math.random() * trackLength,
      speed: config.maxSpeed * lerp(0.42, 0.82, Math.random()) * mode.trafficPressure,
      color: carColors[i % carColors.length],
      laneVelocity: lerp(-0.18, 0.18, Math.random()),
      cooldown: 0,
      nearMissCooldown: 0,
    });
  }
}

function decorateTrack() {
  const billboardLabels = ["Apex", "Mirage", "Nova", "Velocity", "Flux", "Solar"];
  for (const segment of track) {
    segment.billboardText = billboardLabels[segment.index % billboardLabels.length];
  }
}

function seedPickups() {
  pickups.length = 0;
  const laneOffsets = [-0.62, 0, 0.62];
  const mode = currentMode();
  let gateIndex = 0;

  for (let i = 26; i < track.length; i += mode.pickupSpacing) {
    const segment = track[i];
    if (!segment) {
      continue;
    }

    pickups.push({
      z: segment.index * config.segmentLength + config.segmentLength * 0.35,
      offset: laneOffsets[gateIndex % laneOffsets.length],
      color: i % 116 === 0 ? "#ffcf67" : "#4ee7ff",
      active: true,
      pulse: Math.random() * Math.PI * 2,
    });
    gateIndex += 1;
  }
}

function seedStars() {
  stars.length = 0;
  for (let i = 0; i < 160; i += 1) {
    stars.push({
      x: Math.random(),
      y: Math.random() * 0.56,
      size: Math.random() * 2.4 + 0.6,
      alpha: Math.random() * 0.7 + 0.25,
    });
  }
}

function seedClouds() {
  clouds.length = 0;
  for (let i = 0; i < 12; i += 1) {
    clouds.push({
      x: Math.random(),
      y: 0.08 + Math.random() * 0.28,
      width: 0.12 + Math.random() * 0.16,
      height: 0.05 + Math.random() * 0.08,
      speed: 0.003 + Math.random() * 0.006,
      alpha: 0.05 + Math.random() * 0.08,
    });
  }
}

function startRace() {
  const mode = currentMode();
  bootMusic();
  clearTouchInputs();
  state.started = true;
  state.paused = false;
  state.finished = false;
  state.raceClock = 0;
  state.lastLapTime = null;
  state.lapStartClock = 0;
  state.completedLaps = 0;
  state.position = 0;
  state.speed = 0;
  state.playerX = 0;
  state.steering = 0;
  state.nitro = 100;
  state.integrity = 100;
  state.shake = 0;
  state.flash = 0;
  state.countdown = 3.4;
  state.boostActive = false;
  state.score = 0;
  state.combo = 1;
  state.comboTimer = 0;
  state.zoneName = "Open Desert";
  state.modeTimeRemaining = mode.timeLimit || 0;
  particles.length = 0;
  state.overlayScreen = OVERLAY_SCREENS.menu;
  hideOverlay();
  syncStatusLine();
  showToast(mode.startToast);
  seedTraffic();
  seedPickups();
}

function frame(timestamp) {
  if (!state.lastFrame) {
    state.lastFrame = timestamp;
  }

  const dt = Math.min((timestamp - state.lastFrame) / 1000, 0.05);
  state.lastFrame = timestamp;

  update(dt);
  render(timestamp);
  requestAnimationFrame(frame);
}

function update(dt) {
  updateMusic();
  const mode = currentMode();

  if (state.started && !state.paused && !state.finished) {
    if (state.countdown > -0.7) {
      state.countdown -= dt;
    } else {
      state.raceClock += dt;
      if (mode.timeLimit !== null) {
        state.modeTimeRemaining = Math.max(0, state.modeTimeRemaining - dt);
        if (state.modeTimeRemaining <= 0) {
          gameOver("Time Expired", "The clock hit zero before the finish. Hit every gate you can and use near misses to keep the timer alive.");
          updateHud();
          return;
        }
      }
      updatePlayer(dt);
      if (state.finished) {
        updateHud();
        return;
      }
      updateTraffic(dt);
      updatePickups();
      state.integrity = Math.min(100, state.integrity + 1.9 * dt);
      const previousPosition = state.position;
      state.position = increase(state.position, state.speed * dt, trackLength);

      if (previousPosition > state.position) {
        state.completedLaps += 1;
        state.lastLapTime = state.raceClock - state.lapStartClock;
        state.lapStartClock = state.raceClock;
        reactivatePickups();

        if (!mode.endless && state.completedLaps >= mode.laps) {
          finishRace();
        } else if (mode.endless) {
          addScore(1200, true);
          showToast(`Loop ${state.completedLaps}`);
        } else {
          showToast(`Lap ${state.completedLaps} Cleared`);
        }
      }
    }
  }

  if (state.combo > 1) {
    state.comboTimer = Math.max(0, state.comboTimer - dt);
    if (state.comboTimer === 0) {
      state.combo = 1;
    }
  }

  updateCountdown();
  updateParticles(dt);
  state.shake = approach(state.shake, 0, dt * 7);
  state.flash = approach(state.flash, 0, dt * 4);
  state.toastUntil = Math.max(0, state.toastUntil - dt);

  if (state.toastUntil <= 0) {
    ui.toast.classList.remove("visible");
  }

  updateHud();
}

function updatePlayer(dt) {
  const currentSegment = findSegment(state.position + config.playerZ);
  const speedPercent = state.speed / config.maxSpeed;
  const inSurgeZone = isSurgeZone(currentSegment.index);
  state.zoneName = inSurgeZone ? "Surge Corridor" : "Open Desert";

  let steerInput = 0;
  if (input.left) {
    steerInput -= 1;
  }
  if (input.right) {
    steerInput += 1;
  }

  state.steering = approach(state.steering, steerInput, dt * 8);

  if (input.accelerate) {
    state.speed += config.accel * dt;
  } else {
    state.speed += config.decel * dt;
  }

  if (input.brake) {
    state.speed += config.braking * dt;
  }

  state.boostActive = false;
  if (input.boost && state.nitro > 0.5 && state.speed > config.maxSpeed * 0.18) {
    state.speed += config.boostAccel * dt;
    state.nitro = Math.max(0, state.nitro - 30 * dt);
    state.boostActive = true;
    emitBoostTrail();
  } else {
    state.nitro = Math.min(100, state.nitro + 12 * dt);
  }

  const steerPower = input.drift ? 2.2 : 1.35;
  state.playerX += state.steering * steerPower * dt * (0.8 + speedPercent * 2.2);
  state.playerX -= currentSegment.curve * config.centrifugal * speedPercent * 1.6 * dt;

  if (input.drift && Math.abs(state.steering) > 0.1 && state.speed > config.maxSpeed * 0.36) {
    state.speed = Math.max(0, state.speed - config.driftGripLoss * dt);
    emitSparks("#ffcf67", 2);
  }

  if (Math.abs(state.playerX) > 1.06) {
    emitDust();
    state.shake = Math.max(state.shake, 0.9);
    gameOver("Off-Road Crash", "Your car left the circuit. One mistake off the road ends the run, so keep every wheel inside the lane on the next attempt.");
    return;
  }

  state.playerX = clamp(state.playerX, -2.2, 2.2);
  state.speed = clamp(state.speed, 0, config.maxSpeed * 1.07);

  if (inSurgeZone && state.speed > config.maxSpeed * 0.62) {
    addScore(24 * dt, false);
    state.nitro = Math.min(100, state.nitro + 5 * dt);
  }

  handleNearMisses();
  collectPickups();
  handleTrafficCollisions();
}

function updateTraffic(dt) {
  const playerWorldZ = increase(state.position, config.playerZ, trackLength);
  const mode = currentMode();
  const pressure = mode.endless ? 1 + Math.min(0.55, state.raceClock / 95) : 1;

  for (const car of traffic) {
    car.z = increase(car.z, car.speed * dt * pressure, trackLength);
    car.cooldown = Math.max(0, car.cooldown - dt);
    car.nearMissCooldown = Math.max(0, (car.nearMissCooldown || 0) - dt);
    car.offset += car.laneVelocity * dt * pressure;

    if (car.offset > 0.86 || car.offset < -0.86) {
      car.laneVelocity *= -1;
    }

    const distance = wrappedDistance(car.z, playerWorldZ, trackLength);
    if (distance > 0 && distance < 1800) {
      const push = state.playerX > car.offset ? -1 : 1;
      car.offset += push * dt * 0.25;
    }

    car.offset = clamp(car.offset, -0.9, 0.9);
  }
}

function updatePickups() {
  for (const pickup of pickups) {
    if (!pickup.active) {
      continue;
    }
    pickup.pulse += 0.08;
  }
}

function reactivatePickups() {
  for (const pickup of pickups) {
    pickup.active = true;
  }
}

function handleTrafficCollisions() {
  const playerWorldZ = increase(state.position, config.playerZ, trackLength);
  const playerSegment = findSegment(playerWorldZ);

  for (const car of traffic) {
    if (car.cooldown > 0) {
      continue;
    }

    if (findSegment(car.z).index !== playerSegment.index) {
      continue;
    }

    const distanceAhead = wrappedDistance(car.z, playerWorldZ, trackLength);
    if (distanceAhead > config.segmentLength * 0.7) {
      continue;
    }

    if (Math.abs(car.offset - state.playerX) < 0.22) {
      state.shake = Math.max(state.shake, 1.2);
      state.flash = 1;
      car.cooldown = 0.8;
      car.speed *= 0.9;
      car.offset += state.playerX > car.offset ? -0.08 : 0.08;
      emitSparks("#ffffff", 18);
      gameOver("Traffic Collision", "You drove into traffic ahead and totaled the run. Cars closing from behind will no longer end the race, but any direct hit on a car in front still means game over.");
      return;
    }
  }
}

function handleNearMisses() {
  const playerWorldZ = increase(state.position, config.playerZ, trackLength);

  for (const car of traffic) {
    if (car.cooldown > 0 || car.nearMissCooldown > 0) {
      continue;
    }

    const zGap = Math.min(Math.abs(car.z - playerWorldZ), trackLength - Math.abs(car.z - playerWorldZ));
    if (zGap > config.segmentLength * 1.3) {
      continue;
    }

    const lateralGap = Math.abs(car.offset - state.playerX);
    if (lateralGap > 0.22 && lateralGap < 0.42 && state.speed > config.maxSpeed * 0.52) {
      car.nearMissCooldown = 1.8;
      addScore(180, true);
      grantTimeBonus(1.35, "Time Boost");
      emitSparks("#ffcf67", 6);
      showToast("Near Miss");
    }
  }
}

function collectPickups() {
  const playerWorldZ = increase(state.position, config.playerZ, trackLength);

  for (const pickup of pickups) {
    if (!pickup.active) {
      continue;
    }

    const zGap = Math.min(Math.abs(pickup.z - playerWorldZ), trackLength - Math.abs(pickup.z - playerWorldZ));
    if (zGap > config.segmentLength * 0.7) {
      continue;
    }

    if (Math.abs(pickup.offset - state.playerX) < 0.26) {
      pickup.active = false;
      state.nitro = Math.min(100, state.nitro + 24);
      state.integrity = Math.min(100, state.integrity + 8);
      addScore(260, true);
      grantTimeBonus(4.5, "Clock Surge");
      state.flash = Math.max(state.flash, 0.3);
      emitSparks(pickup.color, 12);
      showToast("Surge Gate");
    }
  }
}

function grantTimeBonus(amount, label) {
  const mode = currentMode();
  if (mode.timeLimit === null || amount <= 0 || state.finished) {
    return;
  }

  state.modeTimeRemaining = Math.min(mode.timeLimit, state.modeTimeRemaining + amount);
  if (label) {
    state.zoneName = `${label} +${amount.toFixed(1)}s`;
  }
}

function addScore(basePoints, extendCombo) {
  if (extendCombo) {
    state.combo = Math.min(8, state.combo + 1);
    state.comboTimer = state.comboMax;
  }

  state.score += basePoints * state.combo;
}

function gameOver(reason, detail) {
  if (state.finished) {
    return;
  }

  const mode = currentMode();
  clearTouchInputs();
  state.finished = true;
  state.paused = false;
  state.speed = 0;
  state.nitro = 0;
  state.integrity = 0;
  state.combo = 1;
  state.comboTimer = 0;
  state.overlayScreen = OVERLAY_SCREENS.gameover;
  rememberOverlayContent("Run Terminated", "Race Over", detail);
  showOverlayScreen(OVERLAY_SCREENS.gameover);

  if (mode.endless) {
    const updatedRecord = {
      bestScore: Math.max(state.modeRecord.bestScore || 0, Math.round(state.score)),
      bestSurvival: Math.max(state.modeRecord.bestSurvival || 0, state.raceClock),
    };
    writeModeRecord(mode.id, updatedRecord);
  }

  ui.statusLine.textContent = `${reason}. Score ${String(Math.round(state.score)).padStart(6, "0")}.`;
  showToast(reason);
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const particle = particles[i];
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= 0.985;
    particle.vy *= 0.985;
    particle.size *= 0.99;

    if (particle.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function finishRace() {
  const mode = currentMode();
  clearTouchInputs();
  state.finished = true;
  state.paused = false;
  rememberOverlayContent(
    mode.name,
    "Finish Line Secured",
    "You cleared the mode objective. Hit Run Again to chase a cleaner line, a better time, or a higher style score.",
  );
  showOverlayScreen(OVERLAY_SCREENS.finish);
  const finishCopy = `Finish time ${formatTime(state.raceClock)}. Score ${String(Math.round(state.score)).padStart(6, "0")}. ${bestCopy(state.raceClock)}`;

  if (!state.modeRecord.bestTime || state.raceClock < state.modeRecord.bestTime) {
    writeModeRecord(mode.id, { ...state.modeRecord, bestTime: state.raceClock, bestScore: Math.max(state.modeRecord.bestScore || 0, Math.round(state.score)) });
    ui.statusLine.textContent = finishCopy;
    showToast("New Record");
  } else {
    writeModeRecord(mode.id, { ...state.modeRecord, bestScore: Math.max(state.modeRecord.bestScore || 0, Math.round(state.score)) });
    ui.statusLine.textContent = finishCopy;
    showToast("Race Complete");
  }
}

function bestCopy(currentTime) {
  if (!state.modeRecord.bestTime || currentTime < state.modeRecord.bestTime) {
    return "That is your new best run.";
  }
  return `Best run remains ${formatTime(state.modeRecord.bestTime)}.`;
}

function updateCountdown() {
  if (!state.started || state.finished || state.paused) {
    ui.countdown.classList.remove("visible");
    return;
  }

  if (state.countdown > 0) {
    ui.countdown.classList.add("visible");
    ui.countdown.textContent = Math.ceil(state.countdown);
    return;
  }

  if (state.countdown > -0.7) {
    ui.countdown.classList.add("visible");
    ui.countdown.textContent = "Go";
    return;
  }

  ui.countdown.classList.remove("visible");
}

function updateHud() {
  const mode = currentMode();
  const displayedLap = mode.endless ? state.completedLaps + 1 : Math.min(state.completedLaps + 1, mode.laps);
  const speedKmh = Math.round((state.speed / config.maxSpeed) * 420);
  const lapProgress = ((state.position % trackLength) / trackLength) * 100;
  const comboPercent = state.combo > 1 ? (state.comboTimer / state.comboMax) * 100 : 0;

  ui.speedValue.textContent = String(speedKmh).padStart(3, "0");
  ui.lapValue.textContent = mode.endless ? `${displayedLap} / INF` : `${displayedLap} / ${mode.laps}`;
  ui.timeValue.textContent = mode.timeLimit !== null ? formatTime(state.modeTimeRemaining) : formatTime(state.raceClock);
  ui.lapTimeValue.textContent = state.lastLapTime ? formatTime(state.lastLapTime) : "--:--.--";
  ui.scoreValue.textContent = String(Math.round(state.score)).padStart(6, "0");
  ui.comboValue.textContent = `x${state.combo}`;
  ui.nitroValue.textContent = `${Math.round(state.nitro)}%`;
  ui.integrityValue.textContent = `${Math.round(state.integrity)}%`;
  ui.progressValue.textContent = `${Math.round(lapProgress)}%`;
  ui.comboWindowValue.textContent = state.combo > 1 ? `${state.zoneName} x${state.combo}` : state.zoneName;
  ui.nitroFill.style.width = `${state.nitro}%`;
  ui.integrityFill.style.width = `${state.integrity}%`;
  ui.progressFill.style.width = `${lapProgress}%`;
  ui.comboFill.style.width = `${comboPercent}%`;
}

function syncStatusLine() {
  const mode = currentMode();
  if (mode.endless) {
    const bestScore = state.modeRecord.bestScore || 0;
    const bestSurvival = state.modeRecord.bestSurvival || 0;
    ui.statusLine.textContent = bestScore
      ? `Best survival: ${formatTime(bestSurvival)}. Best score: ${String(Math.round(bestScore)).padStart(6, "0")}.`
      : "Best survival: none recorded yet.";
    return;
  }

  if (!state.modeRecord.bestTime) {
    ui.statusLine.textContent = `Best ${mode.name.toLowerCase()} run: none recorded yet.`;
    return;
  }

  ui.statusLine.textContent = `Best ${mode.name.toLowerCase()} run: ${formatTime(state.modeRecord.bestTime)}.`;
}

function showToast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.add("visible");
  state.toastUntil = 2.2;
}

function render(timestamp) {
  ctx.setTransform(state.pixelRatio, 0, 0, state.pixelRatio, 0, 0);
  ctx.clearRect(0, 0, state.width, state.height);
  state.visualClock = timestamp * 0.001 + (trackLength ? ((state.position % trackLength) / trackLength) * 9 : 0);
  state.sceneCache = null;

  ctx.save();
  if (state.settings.cameraShake && state.shake > 0.01) {
    const amount = state.shake * 7;
    ctx.translate((Math.random() - 0.5) * amount, (Math.random() - 0.5) * amount);
  }

  renderSky();
  renderRoad();
  renderParticles();
  renderSpeedLines();
  renderPlayerCar(timestamp);
  renderScreenBloom();
  renderGlassReflections();

  if (state.flash > 0.02) {
    ctx.fillStyle = `rgba(255,255,255,${state.flash * 0.12})`;
    ctx.fillRect(0, 0, state.width, state.height);
  }

  ctx.restore();
}

function renderScreenBloom() {
  const scene = scenePalette();
  const drive = clamp(state.speed / config.maxSpeed, 0, 1);
  const bloomStrength = scene.bloomStrength;
  const overlay = ctx.createLinearGradient(0, 0, 0, state.height);
  overlay.addColorStop(0, withAlpha(scene.accent, (0.025 + drive * 0.015) * bloomStrength));
  overlay.addColorStop(0.5, "rgba(255,255,255,0)");
  overlay.addColorStop(1, withAlpha(scene.rumbleB, (0.035 + drive * 0.01) * bloomStrength));
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, state.width, state.height);

  if (state.boostActive) {
    const flare = ctx.createRadialGradient(state.width * 0.5, state.height * 0.82, 20, state.width * 0.5, state.height * 0.82, state.width * 0.35);
    flare.addColorStop(0, withAlpha(scene.accent, 0.12 * bloomStrength));
    flare.addColorStop(1, withAlpha(scene.accent, 0));
    ctx.fillStyle = flare;
    ctx.fillRect(0, 0, state.width, state.height);
  }
}

function renderGlassReflections() {
  const scene = scenePalette();
  const glassStrength = scene.glassStrength;
  const sweep = ctx.createLinearGradient(0, 0, state.width, state.height);
  sweep.addColorStop(0.08, withAlpha(scene.accent, 0.08 * glassStrength));
  sweep.addColorStop(0.18, withAlpha(scene.accent, 0));
  sweep.addColorStop(0.72, withAlpha(scene.rumbleB, 0));
  sweep.addColorStop(0.92, withAlpha(scene.rumbleB, 0.08 * glassStrength));
  ctx.fillStyle = sweep;
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.strokeStyle = withAlpha(scene.accent, 0.08 * glassStrength);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(state.width * 0.06, 0);
  ctx.lineTo(state.width * 0.18, state.height);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(state.width * 0.82, 0);
  ctx.lineTo(state.width * 0.94, state.height);
  ctx.stroke();
}

function renderSky() {
  const scene = scenePalette();
  const horizon = state.height * 0.47;
  const gradient = ctx.createLinearGradient(0, 0, 0, horizon);
  gradient.addColorStop(0, scene.skyTop);
  gradient.addColorStop(0.45, scene.skyMid);
  gradient.addColorStop(1, scene.skyBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, state.width, horizon);

  const segment = findSegment(state.position);
  const parallax = -segment.curve * 2600 - state.playerX * 140;
  renderAurora(horizon, parallax, scene);
  renderClouds(horizon, parallax, scene);
  renderSkylineBeams(horizon, parallax, scene);
  renderModeAtmospherics(horizon, scene);

  for (const star of stars) {
    const x = wrap01(star.x + parallax * 0.00002) * state.width;
    const y = star.y * horizon;
    const twinkle = 0.82 + Math.sin(state.raceClock * 1.7 + star.x * 40) * 0.18;
    ctx.fillStyle = `rgba(255,255,255,${star.alpha * twinkle * scene.starAlpha})`;
    ctx.fillRect(x, y, star.size, star.size);
  }

  renderCelestialBodies(horizon, parallax, scene);

  renderMountainLayer(horizon, parallax * 0.18, 126, scene.mountainFar, scene.mountainFarAlpha);
  renderMountainLayer(horizon + 26, parallax * 0.34, 90, scene.mountainNear, scene.mountainNearAlpha);
  renderCityLayer(horizon + 40, parallax * 0.52, scene);
  renderHorizonGlow(horizon, parallax, scene);
  renderDesertGrid(horizon + 6, parallax, scene);
  renderAtmosphericMotes(horizon, scene);
  renderSkyVignette(horizon, scene);

  const floorGradient = ctx.createLinearGradient(0, horizon, 0, state.height);
  floorGradient.addColorStop(0, withAlpha(scene.accentWarm, scene.floorAlpha));
  floorGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = floorGradient;
  ctx.fillRect(0, horizon, state.width, state.height - horizon);
}

function renderCelestialBodies(horizon, parallax, scene) {
  const sunX = state.width * 0.72 + parallax * 0.045;
  const sunY = horizon * scene.sunY;
  const moonX = state.width * 0.28 - parallax * 0.026;
  const moonY = horizon * (0.14 + scene.sunY * 0.38);

  if (scene.moonAlpha > 0.02) {
    renderMoon(moonX, moonY, scene, horizon);
  }

  if (scene.sunAlpha > 0.02) {
    const radius = scene.sunRadius;
    const sunGradient = ctx.createRadialGradient(sunX, sunY, radius * 0.06, sunX, sunY, radius);
    sunGradient.addColorStop(0, withAlpha(scene.sunCore, scene.sunAlpha));
    sunGradient.addColorStop(0.44, withAlpha(scene.sunHalo, scene.sunAlpha * 0.9));
    sunGradient.addColorStop(1, withAlpha(scene.accent, 0));
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(sunX, sunY, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 1.2;
    for (let ring = 0; ring < 3; ring += 1) {
      ctx.strokeStyle = withAlpha(scene.accentWarm, scene.sunAlpha * (0.11 - ring * 0.022));
      ctx.beginPath();
      ctx.arc(sunX, sunY, radius * (1.1 + ring * 0.17), 0, Math.PI * 2);
      ctx.stroke();
    }

    renderSunStreaks(sunX, sunY, scene);
    renderLensArtifacts(sunX, sunY, scene);
  }
}

function renderMoon(x, y, scene, horizon) {
  const radius = scene.moonRadius;
  const moonGradient = ctx.createRadialGradient(x, y, radius * 0.18, x, y, radius);
  moonGradient.addColorStop(0, withAlpha(scene.moonCore, scene.moonAlpha));
  moonGradient.addColorStop(0.48, withAlpha(scene.moonHalo, scene.moonAlpha * 0.8));
  moonGradient.addColorStop(1, withAlpha(scene.moonHalo, 0));
  ctx.fillStyle = moonGradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = withAlpha(scene.moonCore, scene.moonAlpha);
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.36, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = withAlpha(scene.skyMid, 0.96);
  ctx.beginPath();
  ctx.arc(x + radius * 0.26, y - radius * 0.08, radius * 0.32, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 1;
  for (let ring = 0; ring < 3; ring += 1) {
    ctx.strokeStyle = withAlpha(scene.moonRing, scene.moonAlpha * (0.18 - ring * 0.04));
    ctx.beginPath();
    ctx.arc(x, y, radius * (1.12 + ring * 0.18), 0, Math.PI * 2);
    ctx.stroke();
  }

  const moonBeam = ctx.createLinearGradient(0, y - radius * 1.8, 0, horizon + 24);
  moonBeam.addColorStop(0, withAlpha(scene.moonHalo, scene.moonAlpha * 0.12));
  moonBeam.addColorStop(1, withAlpha(scene.moonHalo, 0));
  ctx.fillStyle = moonBeam;
  ctx.fillRect(x - radius * 0.2, y - radius * 1.8, radius * 0.4, horizon + radius * 1.8);
}

function renderSunStreaks(sunX, sunY, scene) {
  for (let i = 0; i < 5; i += 1) {
    const streak = ctx.createLinearGradient(sunX, sunY, sunX + 260 + i * 40, sunY + 120 + i * 26);
    streak.addColorStop(0, withAlpha(scene.accentWarm, 0.16 * scene.sunAlpha));
    streak.addColorStop(1, withAlpha(scene.accentWarm, 0));
    ctx.strokeStyle = streak;
    ctx.lineWidth = 1.4 + i * 0.4;
    ctx.beginPath();
    ctx.moveTo(sunX - 14, sunY + i * 2);
    ctx.lineTo(sunX + 220 + i * 40, sunY + 80 + i * 24);
    ctx.stroke();
  }
}

function renderLensArtifacts(sunX, sunY, scene) {
  const centerX = state.width * 0.5;
  const centerY = state.height * 0.5;
  for (let i = 1; i <= 4; i += 1) {
    const t = i / 5;
    const x = lerp(sunX, centerX, t * 1.2);
    const y = lerp(sunY, centerY, t * 1.2);
    const radius = 10 + i * 14;
    const flare = ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
    flare.addColorStop(0, withAlpha(i % 2 === 0 ? scene.accent : scene.accentWarm, (0.14 - i * 0.02) * scene.lensAlpha));
    flare.addColorStop(1, withAlpha(scene.accent, 0));
    ctx.fillStyle = flare;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderAurora(horizon, parallax, scene) {
  for (let band = 0; band < 3; band += 1) {
    const yBase = horizon * (0.12 + band * 0.1);
    const ribbon = ctx.createLinearGradient(0, yBase - 60, 0, yBase + 80);
    ribbon.addColorStop(0, withAlpha(scene.accent, 0));
    ribbon.addColorStop(0.45, band === 1 ? withAlpha(scene.rumbleB, 0.1 * scene.auroraAlpha) : withAlpha(scene.accent, 0.11 * scene.auroraAlpha));
    ribbon.addColorStop(1, withAlpha(scene.accent, 0));
    ctx.fillStyle = ribbon;
    ctx.beginPath();
    ctx.moveTo(0, yBase);

    for (let x = 0; x <= state.width + 24; x += 24) {
      const wave =
        Math.sin((x + parallax * (0.2 + band * 0.18) + state.raceClock * 120) * 0.005) * (18 + band * 8) +
        Math.cos((x - parallax * 0.4) * 0.0035) * 12;
      ctx.lineTo(x, yBase + wave);
    }

    ctx.lineTo(state.width, yBase + 120);
    ctx.lineTo(0, yBase + 120);
    ctx.closePath();
    ctx.fill();
  }
}

function renderSkylineBeams(horizon, parallax, scene) {
  for (let i = 0; i < 7; i += 1) {
    const x = wrap01(0.15 * i + parallax * 0.00003 + state.raceClock * 0.002) * state.width;
    const beamWidth = 30 + (i % 3) * 12;
    const beamHeight = horizon * (0.34 + (i % 4) * 0.05);
    const beam = ctx.createLinearGradient(0, horizon - beamHeight, 0, horizon + 20);
    beam.addColorStop(0, withAlpha(scene.beam, 0));
    beam.addColorStop(0.25, withAlpha(scene.beam, 0.28 * scene.beamAlpha));
    beam.addColorStop(1, withAlpha(scene.beam, 0));
    ctx.fillStyle = beam;
    ctx.fillRect(x - beamWidth * 0.5, horizon - beamHeight, beamWidth, beamHeight + 20);
  }
}

function renderModeAtmospherics(horizon, scene) {
  if (state.selectedMode === "time_attack") {
    ctx.strokeStyle = withAlpha(scene.accent, 0.13 * scene.modeAtmosAlpha);
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 18; i += 1) {
      const x = wrap01(i * 0.063 + state.raceClock * 0.28) * state.width;
      const y = horizon * (0.1 + (i % 7) * 0.07);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 14, y + 38);
      ctx.stroke();
    }
    return;
  }

  if (state.selectedMode === "survival") {
    for (let i = 0; i < 24; i += 1) {
      const x = wrap01(i * 0.049 + state.raceClock * 0.01) * state.width;
      const y = horizon * 0.22 + (i % 8) * 18 + Math.sin(state.raceClock * 0.9 + i) * 6;
      const radius = 1.4 + (i % 3) * 0.6;
      ctx.fillStyle = withAlpha(scene.accentWarm, (0.12 + (i % 4) * 0.02) * scene.modeAtmosAlpha);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function renderClouds(horizon, parallax, scene) {
  for (const cloud of clouds) {
    const x = wrap01(cloud.x + state.raceClock * cloud.speed + parallax * 0.000006) * state.width;
    const y = cloud.y * horizon;
    const width = cloud.width * state.width;
    const height = cloud.height * horizon;
    const gradient = ctx.createRadialGradient(x, y, width * 0.06, x, y, width * 0.5);
    gradient.addColorStop(0, withAlpha(scene.cloudTint, (cloud.alpha + 0.02) * scene.cloudAlpha));
    gradient.addColorStop(1, withAlpha(scene.cloudTint, 0));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderHorizonGlow(horizon, parallax, scene) {
  const glow = ctx.createLinearGradient(0, horizon - 30, 0, horizon + 100);
  glow.addColorStop(0, withAlpha(scene.accent, 0));
  glow.addColorStop(0.45, scene.horizonGlow);
  glow.addColorStop(0.65, scene.horizonWarm);
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, horizon - 30, state.width, 130);

  for (let i = 0; i < 6; i += 1) {
    const x = wrap01(0.12 * i + parallax * 0.00004) * state.width;
    ctx.fillStyle = withAlpha(scene.accent, 0.09);
    ctx.fillRect(x, horizon - 16, 2, 32);
  }
}

function renderDesertGrid(horizon, parallax, scene) {
  ctx.save();
  ctx.strokeStyle = withAlpha(scene.gridColor, scene.gridAlpha);
  ctx.lineWidth = 1;

  for (let i = -7; i <= 7; i += 1) {
    ctx.beginPath();
    ctx.moveTo(state.width * 0.5 + i * 12 + parallax * 0.04, horizon);
    ctx.lineTo(state.width * 0.5 + i * state.width * 0.12, state.height);
    ctx.stroke();
  }

  for (let i = 0; i < 9; i += 1) {
    const y = lerp(horizon + 10, state.height, Math.pow(i / 8, 1.7));
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(state.width, y);
    ctx.stroke();
  }
  ctx.restore();
}

function renderAtmosphericMotes(horizon, scene) {
  for (let i = 0; i < 18; i += 1) {
    const x = wrap01(i * 0.071 + state.raceClock * 0.01) * state.width;
    const y = horizon + (i % 6) * 28 + Math.sin(state.raceClock * 0.8 + i) * 8;
    const radius = 1.2 + (i % 3) * 0.7;
    ctx.fillStyle = withAlpha(scene.accentWarm, 0.06 + (i % 4) * 0.01);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderSkyVignette(horizon, scene) {
  ctx.fillStyle = scene.haze;
  ctx.fillRect(0, 0, state.width, horizon);

  const vignette = ctx.createRadialGradient(
    state.width * 0.5,
    horizon * 0.36,
    horizon * 0.12,
    state.width * 0.5,
    horizon * 0.36,
    state.width * 0.72,
  );
  vignette.addColorStop(0, withAlpha(scene.accentWarm, 0));
  vignette.addColorStop(1, scene.skyVignette);
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, state.width, horizon + 20);
}

function renderMountainLayer(horizon, shift, amplitude, color, alpha) {
  ctx.fillStyle = withAlpha(color, alpha);
  ctx.beginPath();
  ctx.moveTo(0, horizon + amplitude);

  for (let x = 0; x <= state.width + 24; x += 24) {
    const wave =
      Math.sin((x + shift) * 0.0048) * amplitude * 0.66 +
      Math.sin((x + shift) * 0.011) * amplitude * 0.28 +
      Math.cos((x - shift) * 0.0023) * amplitude * 0.18;
    ctx.lineTo(x, horizon - wave);
  }

  ctx.lineTo(state.width, state.height);
  ctx.lineTo(0, state.height);
  ctx.closePath();
  ctx.fill();
}

function renderCityLayer(horizon, shift, scene) {
  const baseWidth = 28;
  for (let x = -baseWidth; x < state.width + baseWidth; x += baseWidth) {
    const xShifted = x + (shift % (baseWidth * 10));
    const heightWave = Math.abs(Math.sin((xShifted + shift) * 0.016)) * 88 + 30;
    const width = baseWidth - 4;
    const y = horizon - heightWave;

    const buildingGradient = ctx.createLinearGradient(0, y, 0, horizon);
    buildingGradient.addColorStop(0, scene.cityTop);
    buildingGradient.addColorStop(1, scene.cityBottom);
    ctx.fillStyle = buildingGradient;
    ctx.fillRect(xShifted, y, width, heightWave);

    const windowCount = Math.max(1, Math.floor(heightWave / 18));
    for (let row = 0; row < windowCount; row += 1) {
      const flicker = 0.08 + ((row + Math.floor(xShifted)) % 3) * 0.03 + Math.sin(state.raceClock * 1.4 + row + xShifted * 0.01) * 0.01;
      ctx.fillStyle = withAlpha(scene.accent, flicker * scene.cityWindowAlpha);
      ctx.fillRect(xShifted + 4, y + 10 + row * 16, 3, 8);
      if (row % 2 === 0) {
        ctx.fillStyle = withAlpha(scene.accentWarm, flicker * 0.9 * scene.cityWindowAlpha);
        ctx.fillRect(xShifted + width - 7, y + 14 + row * 16, 2, 6);
      }
    }

    ctx.fillStyle = withAlpha(scene.accent, scene.cityCoreAlpha);
    ctx.fillRect(xShifted + width * 0.5 - 1, y + 6, 2, Math.max(8, heightWave - 10));
  }
}

function renderRoad() {
  for (const segment of track) {
    segment.cars.length = 0;
    segment.pickups.length = 0;
  }

  for (const car of traffic) {
    findSegment(car.z).cars.push(car);
  }

  for (const pickup of pickups) {
    if (pickup.active) {
      findSegment(pickup.z).pickups.push(pickup);
    }
  }

  const baseSegment = findSegment(state.position);
  const basePercent = percentRemaining(state.position, config.segmentLength);
  const playerSegment = findSegment(state.position + config.playerZ);
  const playerPercent = percentRemaining(state.position + config.playerZ, config.segmentLength);
  const playerY = interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent) + config.cameraHeight;
  const visibleSegments = [];

  let x = 0;
  let dx = -(baseSegment.curve * basePercent);

  for (let n = 0; n < config.drawDistance; n += 1) {
    const segment = track[(baseSegment.index + n) % track.length];
    const looped = segment.index < baseSegment.index ? trackLength : 0;

    project(segment.p1, state.playerX * config.roadWidth - x, playerY, state.position - looped);
    project(segment.p2, state.playerX * config.roadWidth - x - dx, playerY, state.position - looped);

    x += dx;
    dx += segment.curve;

    if (segment.p1.camera.z <= config.cameraDepth || segment.p2.camera.z <= config.cameraDepth) {
      continue;
    }

    if (segment.p2.screen.y >= segment.p1.screen.y) {
      continue;
    }

    visibleSegments.push(segment);
  }

  for (let i = visibleSegments.length - 1; i >= 0; i -= 1) {
    const segment = visibleSegments[i];
    drawSegment(segment);
    drawSegmentDecor(segment);
    drawPickupsOnSegment(segment);
    drawTrafficOnSegment(segment);
  }
}

function project(point, cameraX, cameraY, cameraZ) {
  point.camera.x = point.world.x - cameraX;
  point.camera.y = point.world.y - cameraY;
  point.camera.z = point.world.z - cameraZ;
  point.screen.scale = config.cameraDepth / point.camera.z;
  point.screen.x = Math.round((1 + point.screen.scale * point.camera.x) * state.width * 0.5);
  point.screen.y = Math.round((1 - point.screen.scale * point.camera.y) * state.height * 0.5);
  point.screen.w = Math.round(point.screen.scale * config.roadWidth * state.width * 0.5);
}

function drawSegment(segment) {
  const scene = scenePalette();
  const p1 = segment.p1.screen;
  const p2 = segment.p2.screen;
  const grassColor = segment.colorBand ? scene.grassDark : scene.grassLight;
  const roadColor = segment.colorBand ? scene.roadDark : scene.roadLight;
  const rumbleColor = segment.colorBand ? scene.rumbleA : scene.rumbleB;
  const zoneGlow = isSurgeZone(segment.index) ? withAlpha(scene.accent, 0.14) : "rgba(255,255,255,0.03)";
  const centerSheen = 0.03 + clamp(state.speed / config.maxSpeed, 0, 1) * 0.04;

  ctx.fillStyle = grassColor;
  ctx.fillRect(0, p2.y, state.width, Math.max(1, p1.y - p2.y));

  drawQuad(rumbleColor, p1.x, p1.y, p1.w * 1.16, p2.x, p2.y, p2.w * 1.16);
  drawQuad(scene.shoulder, p1.x, p1.y, p1.w * 1.03, p2.x, p2.y, p2.w * 1.03);
  drawQuad(roadColor, p1.x, p1.y, p1.w, p2.x, p2.y, p2.w);
  drawQuad(zoneGlow, p1.x, p1.y, p1.w * 0.72, p2.x, p2.y, p2.w * 0.72);
  drawQuad(withAlpha(scene.accentWarm, centerSheen), p1.x, p1.y, p1.w * 0.18, p2.x, p2.y, p2.w * 0.14);

  ctx.fillStyle = scene.laneGlow;
  ctx.fillRect(p2.x - p2.w, p2.y, p2.w * 2, 2);
  ctx.fillStyle = withAlpha(scene.accent, 0.05 + centerSheen * 0.4);
  ctx.fillRect(p2.x - p2.w * 0.6, p2.y + 1, p2.w * 1.2, 2);

  if (segment.index % 5 === 0) {
    drawQuad("rgba(255,255,255,0.035)", p1.x, p1.y, p1.w * 0.12, p2.x, p2.y, p2.w * 0.1);
  }

  for (let lane = 1; lane < config.lanes; lane += 1) {
    const laneX1 = lerp(p1.x - p1.w, p1.x + p1.w, lane / config.lanes);
    const laneX2 = lerp(p2.x - p2.w, p2.x + p2.w, lane / config.lanes);
    drawQuad(palette.lane, laneX1, p1.y, p1.w * 0.012, laneX2, p2.y, p2.w * 0.012);
    if (segment.index % 3 === 0) {
      drawQuad(withAlpha(scene.accent, 0.04), laneX1, p1.y, p1.w * 0.024, laneX2, p2.y, p2.w * 0.02);
    }
  }
}

function drawSegmentDecor(segment) {
  const scene = scenePalette();
  const p1 = segment.p1.screen;
  const p2 = segment.p2.screen;
  const pulse = 0.5 + Math.sin((segment.index + state.raceClock * 6) * 0.7) * 0.5;
  const beaconWidth = Math.max(1.5, p2.w * 0.018);
  const leftX = p2.x - p2.w * 1.09;
  const rightX = p2.x + p2.w * 1.09;
  const top = p2.y - 26;
  const height = Math.max(18, (p1.y - p2.y) * 1.2);

  ctx.fillStyle = withAlpha(scene.accent, 0.16 + pulse * 0.16);
  ctx.fillRect(leftX - beaconWidth * 0.5, top, beaconWidth, height);
  ctx.fillRect(rightX - beaconWidth * 0.5, top, beaconWidth, height);

  ctx.fillStyle = withAlpha(scene.rumbleB, 0.12 + pulse * 0.18);
  ctx.beginPath();
  ctx.arc(leftX, top + 2, beaconWidth * 1.6, 0, Math.PI * 2);
  ctx.arc(rightX, top + 2, beaconWidth * 1.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = withAlpha(scene.accentWarm, 0.12 + pulse * 0.08);
  ctx.fillRect(leftX - beaconWidth * 0.22, top + height * 0.22, beaconWidth * 0.44, beaconWidth * 0.44);
  ctx.fillRect(rightX - beaconWidth * 0.22, top + height * 0.22, beaconWidth * 0.44, beaconWidth * 0.44);

  if (segment.index % 17 === 0) {
    drawBillboard(leftX - beaconWidth * 5.5, top - 32, beaconWidth * 7.4, beaconWidth * 4.2, segment.billboardText);
  }

  if (segment.index % 23 === 0) {
    drawDrone(rightX + beaconWidth * 2.2, top - 22, beaconWidth * 2.1, pulse);
  }

  if (segment.index % 19 === 0) {
    drawRockSpire(leftX - beaconWidth * 3.4, top + height * 0.2, beaconWidth * 4.2, pulse);
  }

  if (segment.index % 27 === 0) {
    drawPalmSilhouette(rightX + beaconWidth * 2.9, top + height * 0.15, beaconWidth * 3.8, pulse);
  }

  if (isSurgeZone(segment.index) && segment.index % 4 === 0) {
    drawGateArch(p2.x, p2.y - 10, p2.w * 0.86, pulse);
  }
}

function drawPickupsOnSegment(segment) {
  if (!segment.pickups.length) {
    return;
  }

  for (const pickup of segment.pickups) {
    const percent = percentRemaining(pickup.z, config.segmentLength);
    const roadWidth = interpolate(segment.p1.screen.w, segment.p2.screen.w, percent);
    const x = interpolate(segment.p1.screen.x, segment.p2.screen.x, percent) + roadWidth * pickup.offset;
    const y = interpolate(segment.p1.screen.y, segment.p2.screen.y, percent);
    const size = Math.max(8, roadWidth * 0.14);
    const pulse = 0.7 + Math.sin(pickup.pulse + state.raceClock * 8) * 0.3;
    const beam = ctx.createLinearGradient(0, y - size * 4.6, 0, y);
    beam.addColorStop(0, withAlpha(pickup.color, 0));
    beam.addColorStop(0.45, withAlpha(pickup.color, 0.2));
    beam.addColorStop(1, withAlpha(pickup.color, 0));
    ctx.fillStyle = beam;
    ctx.fillRect(x - size * 0.28, y - size * 4.6, size * 0.56, size * 4.8);

    const ring = ctx.createRadialGradient(x, y - size * 0.9, 0, x, y - size * 0.9, size * 1.4);
    ring.addColorStop(0, withAlpha(pickup.color, 0.24));
    ring.addColorStop(1, withAlpha(pickup.color, 0));
    ctx.fillStyle = ring;
    ctx.beginPath();
    ctx.arc(x, y - size * 0.9, size * 1.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = withAlpha(pickup.color, 0.78);
    ctx.lineWidth = Math.max(2, size * 0.12);
    ctx.beginPath();
    ctx.arc(x, y - size * 0.9, size * (0.54 + pulse * 0.2), 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawTrafficOnSegment(segment) {
  if (!segment.cars.length) {
    return;
  }

  segment.cars.sort((a, b) => b.z - a.z);

  for (const car of segment.cars) {
    const percent = percentRemaining(car.z, config.segmentLength);
    const screenScale = interpolate(segment.p1.screen.scale, segment.p2.screen.scale, percent);
    const roadWidth = interpolate(segment.p1.screen.w, segment.p2.screen.w, percent);
    const x = interpolate(segment.p1.screen.x, segment.p2.screen.x, percent) + roadWidth * car.offset;
    const y = interpolate(segment.p1.screen.y, segment.p2.screen.y, percent);
    const width = Math.max(12, roadWidth * 0.23);
    const height = width * 0.54;

    drawTrafficCar(x, y, width, height, car.color, screenScale);
  }
}

function drawTrafficCar(x, y, width, height, color, scale) {
  ctx.save();
  ctx.translate(x, y - height);

  const glow = ctx.createRadialGradient(0, 0, width * 0.08, 0, 0, width * 0.7);
  glow.addColorStop(0, withAlpha(color, 0.32));
  glow.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(0, height * 0.18, width * 0.95, height * 1.4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#07121f";
  roundedRect(-width * 0.45, 0, width * 0.9, height, width * 0.16);
  ctx.fill();

  ctx.fillStyle = color;
  roundedRect(-width * 0.36, height * 0.08, width * 0.72, height * 0.68, width * 0.14);
  ctx.fill();

  const roofGradient = ctx.createLinearGradient(0, 0, 0, height * 0.86);
  roofGradient.addColorStop(0, "rgba(255,255,255,0.22)");
  roofGradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = roofGradient;
  roundedRect(-width * 0.3, height * 0.1, width * 0.6, height * 0.42, width * 0.12);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.78)";
  roundedRect(-width * 0.18, height * 0.2, width * 0.36, height * 0.16, width * 0.08);
  ctx.fill();

  ctx.fillStyle = "rgba(78,231,255,0.88)";
  ctx.fillRect(-width * 0.3, height * 0.56, width * 0.18, height * 0.08);
  ctx.fillRect(width * 0.12, height * 0.56, width * 0.18, height * 0.08);

  ctx.fillStyle = "rgba(255,92,149,0.92)";
  ctx.fillRect(-width * 0.31, height * 0.83, width * 0.2, height * 0.08);
  ctx.fillRect(width * 0.11, height * 0.83, width * 0.2, height * 0.08);

  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.fillRect(-width * 0.22, height * 0.12, width * 0.04, height * 0.62);
  ctx.fillRect(width * 0.18, height * 0.12, width * 0.04, height * 0.62);

  ctx.globalAlpha = clamp(scale * 280, 0.04, 0.24);
  ctx.fillStyle = "#02060f";
  ctx.beginPath();
  ctx.ellipse(0, height * 1.04, width * 0.48, height * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBillboard(x, y, width, height, label) {
  ctx.save();
  ctx.translate(x, y);
  const panelGradient = ctx.createLinearGradient(0, 0, width, height);
  panelGradient.addColorStop(0, "rgba(8,20,36,0.92)");
  panelGradient.addColorStop(1, "rgba(24,11,34,0.92)");
  ctx.fillStyle = panelGradient;
  roundedRect(0, 0, width, height, Math.max(4, width * 0.08));
  ctx.fill();

  ctx.strokeStyle = "rgba(78,231,255,0.45)";
  ctx.lineWidth = Math.max(1.2, width * 0.03);
  roundedRect(0, 0, width, height, Math.max(4, width * 0.08));
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.94)";
  ctx.font = `${Math.max(8, height * 0.42)}px Agency FB, Bahnschrift, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, width * 0.5, height * 0.52);
  ctx.restore();
}

function drawDrone(x, y, size, pulse) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = `rgba(78,231,255,${0.24 + pulse * 0.18})`;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.6, size * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,92,149,0.7)";
  ctx.fillRect(-size * 1.4, -size * 0.2, size * 0.5, size * 0.14);
  ctx.fillRect(size * 0.9, -size * 0.2, size * 0.5, size * 0.14);
  ctx.restore();
}

function drawGateArch(x, y, width, pulse) {
  const scene = scenePalette();
  ctx.strokeStyle = withAlpha(scene.accent, 0.18 + pulse * 0.26);
  ctx.lineWidth = Math.max(1.5, width * 0.02);
  ctx.beginPath();
  ctx.moveTo(x - width, y + 34);
  ctx.quadraticCurveTo(x, y - width * 0.12, x + width, y + 34);
  ctx.stroke();

  ctx.strokeStyle = withAlpha(scene.rumbleB, 0.14 + pulse * 0.18);
  ctx.beginPath();
  ctx.moveTo(x - width * 0.8, y + 34);
  ctx.quadraticCurveTo(x, y - width * 0.05, x + width * 0.8, y + 34);
  ctx.stroke();

  const core = ctx.createRadialGradient(x, y + 22, width * 0.04, x, y + 22, width * 0.42);
  core.addColorStop(0, withAlpha(scene.accentWarm, 0.12 + pulse * 0.08));
  core.addColorStop(1, withAlpha(scene.accentWarm, 0));
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.ellipse(x, y + 24, width * 0.44, width * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawRockSpire(x, y, size, pulse) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = `rgba(15, 24, 42, ${0.72 + pulse * 0.06})`;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.22, -size * 0.9);
  ctx.lineTo(size * 0.46, -size * 1.4);
  ctx.lineTo(size * 0.72, -size * 0.84);
  ctx.lineTo(size * 0.9, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(78,231,255,0.18)";
  ctx.lineWidth = Math.max(1, size * 0.04);
  ctx.beginPath();
  ctx.moveTo(size * 0.42, -size * 1.18);
  ctx.lineTo(size * 0.56, -size * 0.36);
  ctx.stroke();
  ctx.restore();
}

function drawPalmSilhouette(x, y, size, pulse) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = `rgba(18, 31, 25, ${0.82 + pulse * 0.08})`;
  ctx.lineWidth = Math.max(1.4, size * 0.08);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.1, -size * 0.55, size * 0.22, -size * 1.24);
  ctx.stroke();

  const fronds = [
    [-0.72, -0.2],
    [-0.52, -0.5],
    [0.5, -0.55],
    [0.76, -0.18],
    [0.08, -0.76],
  ];
  for (const [fx, fy] of fronds) {
    ctx.beginPath();
    ctx.moveTo(size * 0.22, -size * 1.24);
    ctx.quadraticCurveTo(size * 0.26, -size * 1.1, size * (0.22 + fx), size * (-1.24 + fy));
    ctx.stroke();
  }
  ctx.restore();
}

function renderPlayerCar(timestamp) {
  const scene = scenePalette();
  const baseX = state.width * 0.5 + state.steering * 34;
  const baseY = state.height * 0.83 + Math.sin(timestamp * 0.008) * 2;
  const width = Math.min(184, Math.max(118, state.width * 0.13));
  const height = width * 0.54;

  ctx.save();
  ctx.translate(baseX, baseY);
  ctx.rotate(state.steering * -0.045);

  const shadowGradient = ctx.createRadialGradient(0, height * 0.86, 12, 0, height * 0.86, width * 0.95);
  shadowGradient.addColorStop(0, "rgba(0,0,0,0.44)");
  shadowGradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shadowGradient;
  ctx.beginPath();
  ctx.ellipse(0, height * 0.9, width * 0.95, height * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();

  if (state.boostActive) {
    ctx.fillStyle = withAlpha(scene.accent, 0.34);
    ctx.beginPath();
    ctx.ellipse(0, height * 0.86, width * 1.32, height * 0.54, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const underglow = ctx.createRadialGradient(0, height * 0.76, width * 0.08, 0, height * 0.76, width * 0.9);
  underglow.addColorStop(0, withAlpha(scene.accent, 0.26));
  underglow.addColorStop(1, withAlpha(scene.accent, 0));
  ctx.fillStyle = underglow;
  ctx.beginPath();
  ctx.ellipse(0, height * 0.8, width * 0.9, height * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#091424";
  roundedRect(-width * 0.5, 0, width, height, width * 0.15);
  ctx.fill();

  const bodyGradient = ctx.createLinearGradient(-width * 0.5, 0, width * 0.5, height);
  bodyGradient.addColorStop(0, scene.rumbleB);
  bodyGradient.addColorStop(0.5, scene.accentWarm);
  bodyGradient.addColorStop(1, scene.accent);
  ctx.fillStyle = bodyGradient;
  roundedRect(-width * 0.43, height * 0.08, width * 0.86, height * 0.7, width * 0.14);
  ctx.fill();

  const gloss = ctx.createLinearGradient(0, height * 0.08, 0, height * 0.52);
  gloss.addColorStop(0, "rgba(255,255,255,0.28)");
  gloss.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gloss;
  roundedRect(-width * 0.34, height * 0.12, width * 0.68, height * 0.26, width * 0.12);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.84)";
  roundedRect(-width * 0.22, height * 0.18, width * 0.44, height * 0.18, width * 0.08);
  ctx.fill();

  ctx.fillStyle = "rgba(7,17,30,0.95)";
  roundedRect(-width * 0.18, height * 0.4, width * 0.36, height * 0.18, width * 0.06);
  ctx.fill();

  ctx.fillStyle = "#0b1323";
  roundedRect(-width * 0.52, height * 0.2, width * 0.1, height * 0.3, width * 0.04);
  roundedRect(width * 0.42, height * 0.2, width * 0.1, height * 0.3, width * 0.04);
  roundedRect(-width * 0.52, height * 0.66, width * 0.1, height * 0.3, width * 0.04);
  roundedRect(width * 0.42, height * 0.66, width * 0.1, height * 0.3, width * 0.04);
  ctx.fill();

  ctx.fillStyle = withAlpha(scene.accent, 0.95);
  ctx.fillRect(-width * 0.33, height * 0.66, width * 0.15, height * 0.08);
  ctx.fillRect(width * 0.18, height * 0.66, width * 0.15, height * 0.08);

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.fillRect(-width * 0.33, height * 0.12, width * 0.14, height * 0.08);
  ctx.fillRect(width * 0.19, height * 0.12, width * 0.14, height * 0.08);

  ctx.fillStyle = withAlpha(scene.accentWarm, 0.36);
  ctx.fillRect(-width * 0.03, height * 0.12, width * 0.06, height * 0.55);

  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = Math.max(1.2, width * 0.014);
  ctx.beginPath();
  ctx.moveTo(-width * 0.22, height * 0.24);
  ctx.quadraticCurveTo(0, height * 0.06, width * 0.22, height * 0.24);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-width * 0.12, height * 0.76);
  ctx.lineTo(width * 0.12, height * 0.76);
  ctx.stroke();

  if (state.boostActive) {
    const flameGradient = ctx.createLinearGradient(0, height * 0.72, 0, height * 1.28);
    flameGradient.addColorStop(0, "rgba(255,255,255,0.95)");
    flameGradient.addColorStop(0.4, withAlpha(scene.accent, 0.9));
    flameGradient.addColorStop(1, withAlpha(scene.rumbleB, 0));
    ctx.fillStyle = flameGradient;

    ctx.beginPath();
    ctx.moveTo(-width * 0.15, height * 0.76);
    ctx.lineTo(-width * 0.06, height * 1.24);
    ctx.lineTo(0, height * 0.76);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(width * 0.15, height * 0.76);
    ctx.lineTo(width * 0.06, height * 1.26);
    ctx.lineTo(0, height * 0.76);
    ctx.closePath();
    ctx.fill();
  }

  const rimGlow = withAlpha(scene.accent, 0.24 + Math.sin(timestamp * 0.01) * 0.04);
  ctx.strokeStyle = rimGlow;
  ctx.lineWidth = Math.max(1, width * 0.018);
  ctx.beginPath();
  ctx.ellipse(-width * 0.47, height * 0.35, width * 0.06, height * 0.14, 0, 0, Math.PI * 2);
  ctx.ellipse(width * 0.47, height * 0.35, width * 0.06, height * 0.14, 0, 0, Math.PI * 2);
  ctx.ellipse(-width * 0.47, height * 0.8, width * 0.06, height * 0.14, 0, 0, Math.PI * 2);
  ctx.ellipse(width * 0.47, height * 0.8, width * 0.06, height * 0.14, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function renderParticles() {
  for (const particle of particles) {
    const alpha = clamp(particle.life, 0, 1) * particle.alpha;
    ctx.fillStyle = withAlpha(particle.color, alpha);
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderSpeedLines() {
  if (state.speed < config.maxSpeed * 0.58) {
    return;
  }

  const intensity = clamp((state.speed - config.maxSpeed * 0.58) / (config.maxSpeed * 0.5), 0, 1);
  ctx.strokeStyle = `rgba(255,255,255,${0.06 + intensity * 0.08})`;
  ctx.lineWidth = 1.1;

  for (let i = 0; i < 22; i += 1) {
    const x = wrap01((i * 0.071 + state.raceClock * 0.9) % 1) * state.width;
    const y = state.height * 0.56 + (i % 11) * state.height * 0.035;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 12 - intensity * 18, y + 28 + intensity * 18);
    ctx.stroke();
  }
}

function emitBoostTrail() {
  const baseX = state.width * 0.5 + state.steering * 34;
  const baseY = state.height * 0.86;

  for (let i = 0; i < 4; i += 1) {
    particles.push({
      x: baseX + lerp(-30, 30, Math.random()),
      y: baseY + lerp(-4, 8, Math.random()),
      vx: lerp(-10, 10, Math.random()),
      vy: lerp(110, 170, Math.random()),
      size: lerp(3, 7, Math.random()),
      life: 0.42,
      alpha: 0.7,
      color: i % 2 === 0 ? "#4ee7ff" : "#ffffff",
    });
  }
}

function emitDust() {
  if (Math.random() > 0.55) {
    return;
  }

  particles.push({
    x: state.width * 0.5 + lerp(-90, 90, Math.random()),
    y: state.height * 0.88,
    vx: lerp(-18, 18, Math.random()),
    vy: lerp(24, 70, Math.random()),
    size: lerp(6, 12, Math.random()),
    life: 0.32,
    alpha: 0.28,
    color: "#ffcf67",
  });
}

function emitSparks(color, amount) {
  const baseX = state.width * 0.5 + state.steering * 24;
  const baseY = state.height * 0.82;

  for (let i = 0; i < amount; i += 1) {
    particles.push({
      x: baseX + lerp(-36, 36, Math.random()),
      y: baseY + lerp(-24, 18, Math.random()),
      vx: lerp(-120, 120, Math.random()),
      vy: lerp(-40, 160, Math.random()),
      size: lerp(1.2, 3.6, Math.random()),
      life: 0.46,
      alpha: 0.88,
      color,
    });
  }
}

function findSegment(z) {
  return track[Math.floor(z / config.segmentLength) % track.length];
}

function increase(start, increment, max) {
  let result = start + increment;
  while (result >= max) {
    result -= max;
  }
  while (result < 0) {
    result += max;
  }
  return result;
}

function wrappedDistance(a, b, max) {
  return ((a - b + max) % max + max) % max;
}

function isSurgeZone(segmentIndex) {
  const mod = segmentIndex % 140;
  return mod >= 92 && mod <= 108;
}

function percentRemaining(n, total) {
  return (n % total) / total;
}

function interpolate(a, b, percent) {
  return a + (b - a) * percent;
}

function easeIn(a, b, percent) {
  return a + (b - a) * percent * percent;
}

function easeInOut(a, b, percent) {
  return a + (b - a) * ((-Math.cos(percent * Math.PI) / 2) + 0.5);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function approach(value, target, delta) {
  if (value < target) {
    return Math.min(target, value + delta);
  }
  return Math.max(target, value - delta);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const centiseconds = Math.floor((seconds - Math.floor(seconds)) * 100);
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

function wrap01(value) {
  let result = value;
  while (result < 0) {
    result += 1;
  }
  while (result >= 1) {
    result -= 1;
  }
  return result;
}

function withAlpha(hex, alpha) {
  const color = parseColor(hex);
  return `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${clamp(alpha, 0, 1)})`;
}

function parseColor(value) {
  if (typeof value !== "string") {
    return { r: 255, g: 255, b: 255, a: 1 };
  }

  const normalized = value.trim();
  if (normalized.startsWith("#")) {
    const hex = normalized.replace("#", "");
    const expanded = hex.length === 3
      ? hex.split("").map((item) => item + item).join("")
      : hex;
    return {
      r: parseInt(expanded.slice(0, 2), 16),
      g: parseInt(expanded.slice(2, 4), 16),
      b: parseInt(expanded.slice(4, 6), 16),
      a: 1,
    };
  }

  const rgbaMatch = normalized.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbaMatch) {
    const parts = rgbaMatch[1].split(",").map((part) => part.trim());
    return {
      r: Number(parts[0]) || 0,
      g: Number(parts[1]) || 0,
      b: Number(parts[2]) || 0,
      a: parts[3] !== undefined ? Number(parts[3]) || 0 : 1,
    };
  }

  return { r: 255, g: 255, b: 255, a: 1 };
}

function mixColor(from, to, t) {
  const start = parseColor(from);
  const end = parseColor(to);
  const blend = clamp(t, 0, 1);
  const r = lerp(start.r, end.r, blend);
  const g = lerp(start.g, end.g, blend);
  const b = lerp(start.b, end.b, blend);
  const a = lerp(start.a ?? 1, end.a ?? 1, blend);
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a.toFixed(3)})`;
}

function drawQuad(color, x1, y1, w1, x2, y2, w2) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1 - w1, y1);
  ctx.lineTo(x2 - w2, y2);
  ctx.lineTo(x2 + w2, y2);
  ctx.lineTo(x1 + w1, y1);
  ctx.closePath();
  ctx.fill();
}

function roundedRect(x, y, width, height, radius) {
  const r = Math.min(radius, width * 0.5, height * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
