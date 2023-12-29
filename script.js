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
  //


  // $('#log').innerHTML = ``
  // for (let [id, s] of getAllScreens()) {
  //   if (id === currentScreenId) {
  //     // ctx.fillStyle = "#000";
  //     // ctx.fillRect(0, 0, canvas.width, canvas.height);
  //     // canvas.width = s.width;
  //     // canvas.height = s.height;
  //     // ctx.drawImage(video, s.screenX, s.screenY, s.width, s.height, 0, 0, s.width, s.height);
  //     for (let k in s) {
  //       $('#log').innerHTML += `<span>${k}</span><span>${s[k]}</span>`
  //     }
  //     break
  //   }
  //   // $('#box').style.left = `${s.screenX}px`;
  //   // $('#box').style.top = `${s.screenY}px`;
  //   // $('#box').style.width = `${s.screenWidth}px`;
  //   // $('#box').style.height = `${s.screenWidth}px`;
  // }
  //
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

function onClose() {
  removeScreen();
  return ""
}

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

        // canvas.width = window.screen.availWidth;
        // canvas.height = window.screen.availHeight;

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
  canvas.width = window.screen.availWidth;
  canvas.height = window.screen.availHeight;
  // canvas.width = video.width;
  // canvas.height = video.height;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const [screenId, screen] of getAllScreens()) {
    ctx.rect(screen.screenX, screen.screenY, screen.width, screen.height)
    ctx.fillStyle = 'yellow';
    ctx.fill();
    ctx.lineWidth = 7;
    ctx.strokeStyle = 'blue';
    ctx.stroke();
    // ctx.drawImage(video, screen.screenX, screen.screenY, screen.width, screen.height, screen.screenX, screen.screenY, screen.width, screen.height);
    // ctx.drawImage(video, 0, 0, screen.screenWidth, screen.screenHeight);
    // ctx.drawImage(video, 0, 0, screen.screenWidth, screen.screenHeight);
  }

  const a = document.createElement("a")
  a.href = canvas.toDataURL("image/png");
  a.download = `${Date.now()}.png`
  // a.click();

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  $('dialog img').src = a.href;
  $('dialog button#closeDialog').onclick = function () {
    $('dialog').close()
    $('dialog').setAttribute("z-index", "0");
    $('dialog img').src = "";
  }
  $('dialog').setAttribute("z-index", "9999");
  $('dialog').showModal()

  // ctx.fillStyle = "#000";
  // ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function startRecording() {
  startCamera();
}
// function saveVideo() {}

// window.onbeforeunload = onClose;
function init() {
  startCameraBtn.onclick = startCamera
  saveImageBtn.onclick = saveImage
  startRecordingBtn.onclick = startRecording

  timers.push(setInterval(updateDom, 10))
}
init()
