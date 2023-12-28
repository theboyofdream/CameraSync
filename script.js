const $ = (selector) => document.querySelector(selector);

const video = $("video#camera");
const startCameraBtn = $("button#startCamera");
const saveImageBtn = $("button#saveImage");
const startRecordingBtn = $("button#startRecording");
const saveRecordingBtn = $("button#saveRecording");

const canvas = $("canvas#canvas")
const ctx = canvas.getContext("2d")


let timers = [];
let cameraStarted = false;
let currentScreenId = `screen-${getScreenId()}`;


function setScreenDetails() {
  currentScreenId && window.localStorage.setItem(
    currentScreenId,
    JSON.stringify({
      screenX: window.screenX,
      screenY: window.screenY,
      screenWidth: window.screen.availWidth,
      screenHeight: window.screen.availHeight,
      width: window.outerWidth,
      height: window.innerHeight,
      updated: Date.now(),
      cameraStarted,
    })
  );
}
function getAllScreens() {
  return Object.keys(window.localStorage)
    .filter((key) => key.startsWith("screen-"))
    .map((key) => [key, JSON.parse(window.localStorage.getItem(key))]);
}
function getScreenId() {
  return (
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith("screen-"))
      .map((key) => parseInt(key.replace("screen-", "")))
      .sort((a, b) => a - b)
      .at(-1) + 1 || 1
  );
}
function removeScreen() {
  currentScreenId && window.localStorage.removeItem(currentScreenId);
}
function removeOldScreens() {
  for (const [screenId, screen] of getAllScreens()) {
    if (Date.now() - screen.updated > 1000) {
      window.localStorage.removeItem(screenId);
    }
  }
}
function updateScreenPosition() {
  video?.setAttribute("style", `transform: translate(-${window.screenX}px, -${window.screenY}px)`);
}


function updateDom() {
  for (const [screenId, screen] of getAllScreens()) {
    if (screen.cameraStarted && !startCameraBtn.classList.contains('hide')) {
      startCamera()
      startCameraBtn.classList.add('hide')
      break
    }
    if (!screen.cameraStarted) {
      startCameraBtn.classList.remove('hide')
    }
  }
}

function onClose() {
  removeScreen();
}
/* function syncDom() {
  if (window.localStorage.getItem("start-btn") === "clicked") {
    startCamera()
  }
} */


function startCamera() {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      if (video) {
        cameraStarted = true;
        saveImageBtn.disabled = false

        video.width = window.screen.availWidth;
        video.height = window.screen.availHeight;
        video.srcObject = stream;
        video.play();

        timers.push(...[
          setInterval(setScreenDetails, 10),
          setInterval(removeOldScreens, 100),
          setInterval(updateScreenPosition, 10),
        ])
      }
    })
    .catch((err) => {
      console.error(err);
      alert(`${err}`);
    });
}

function saveImage() {
  canvas.width = window.outerWidth;
  canvas.height = window.outerHeight;
  ctx.drawImage(video, 0, 0, window.outerWidth, window.outerHeight);

  const a = document.createElement("a")
  a.href = canvas.toDataURL("image/png");
  a.download = `${Date.now()}.png`
  a.click();

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function startRecording() {
  startCamera();
}
// function saveVideo() {}

function init() {
  startCameraBtn.onclick = startCamera
  saveImageBtn.onclick = saveImage
  startRecordingBtn.onclick = startRecording

  timers.push(setInterval(updateDom, 10))

  window.onbeforeunload = onClose
}
init()
