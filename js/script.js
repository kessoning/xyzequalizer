// Variables
let showred = false;
let cameratranslate = 5000;
let randomcounter = 0;
let rotSpeed = 2.0;
let extmultiplier = 1.3;
let blackflash = false;

// sensitivity
let sensitivity = 20;

// keeping the counter of the frames
let frameCount = 0;

// scene, camera and renderer for threejs
let scene, threejscamera, renderer;

// floor
let geo, mat, plane;


// make the canvas adaptable to the window screen
window.addEventListener('resize', function() {
  let width = window.innerWidth;
  let height = window.innerHeight;
  renderer.setSize(width, height);
  threejscamera.aspect = width / height;
  threejscamera.updateProjectionMatrix();
});

const init = function() {
  // init the scene...
  scene = new THREE.Scene();
  // ... the camera... 
  threejscamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
  threejscamera.translateZ(1500);
  scene.add(threejscamera);
  threejscamera.position.x = -4000 + Math.random()*2000;
  threejscamera.position.y = 1000;
  initCamera();
  // ... and the renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor( 0x000000, 0);
  document.body.appendChild(renderer.domElement);
  
  // Floor
  geo = new THREE.PlaneBufferGeometry(20000, 20000, 8, 8);
  mat = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  plane = new THREE.Mesh(geo, mat);

  scene.add(plane);
  plane.rotateX(-Math.PI/2);

  // Lights
  initLights();
  
  initSphere();
}

// update function
const update = function() {

  updateAudio();

  updateSphere();

  // if a bass frequency, probably the kick, is high, then activate some efects and do some randomizations
  if (frequencies[3] > 200) {
    randomize();
  }

  // Increase the randomcounter, to reduce the chaos
  randomcounter++;

  // If it is activated, show the red particle system and the red light
  updateLights();
  
  updateCamera();

  // keep the count of the frames, for the blinking option
  frameCount++;
};

// render function
const render = function() {
  // let's render the actual scene, first parameter is the scene, second the threejscamera
  renderer.render(scene, threejscamera);
};

// Game Loop function (update, render, repeat)
const draw = function() {

  requestAnimationFrame(draw);

  // update and render
  update();
  render();
};

const randomize = function() {
  // if rotation speed is bigger than 2, put it back to 2
    if (rotSpeed > 2) {
      rotSpeed = 2;
      cameracontrols.autoRotateSpeed = rotSpeed;
    }

    // Randomly select if the blinking of the white particle system is activated or not
    if (Math.random() > 0.5) blackflash = !blackflash;

    // Possibility to show or not to show the red particle system
    if (Math.random() > 0.5) showred = !showred;

    // Change the multiplier for the red particle system, to increase the number of combinations
    if (extmultiplier > 1) extmultiplier = 0.7;
    else extmultiplier = 1.3;

    // If the radius is bigger than 20, reduce it to 20
    if (radius > 20) radius = 20;

    // translate the camera back and then put it in the new location
    threejscamera.translateZ(-cameratranslate);
    cameratranslate = 1000 + Math.random()*500;
    threejscamera.translateZ(cameratranslate);
    threejscamera.position.x = -2000 + Math.random()*1000;
    threejscamera.position.y = 400;

    // Some randomizations
    if (randomcounter > 15) {
      nx += Math.random();
      if (rotSpeed > 2) rotSpeed = 2;
      else rotSpeed = 2 + Math.random()*100;
      randomcounter = 0;
      cameracontrols.autoRotateSpeed = rotSpeed;
      radius = 50;
    }
}

// Promise, init the audio first and then all the rest
initAudio().then(() => {
  init();
  draw();
});
