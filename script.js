const $ = (selector) => document.querySelector(selector);

const video = $("video#camera");
const startCameraBtn = $("button#startCamera");

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
  video?.setAttribute("style", `transform: translate(-${window.screenX}px, -${window.screenY}px) scaleX(-1)`);
}

function updateDom() {
  for (const [screenId, screen] of getAllScreens()) {
    if (screen.cameraStarted && !startCameraBtn.classList.contains('hide')) {
      startCamera()
      startCameraBtn.classList.add('hide')
    }
    if (!screen.cameraStarted) {
      startCameraBtn.classList.remove('hide')
    }
  }
}

function startCamera() {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      if (video) {
        cameraStarted = true;

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


startCameraBtn.onclick = startCamera
timers.push(setInterval(updateDom, 10))
