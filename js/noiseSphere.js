// Variables
let showred = false;
let nx = 0;
let ny = 0;
let radius = 20;
let showred = false;
let cameratranslate = 5000;
let randomcounter = 0;
let rotSpeed = 2.0;
let cameraz = 0;
let extmultiplier = 1.3;
let blackflash = false;

// sensitivity
var sensitivity = 10;

// keeping the counter of the frames
var frameCount = 0;

var audioCtx;
var analyser;

var bufferLength;
var dataArray;
var frequencies;

var source;

var meter;

// success callback when requesting audio input stream
function gotStream(stream) {
    //window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();;

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;

    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    frequencies = new Uint8Array(analyser.frequencyBinCount);

    // Create an AudioNode from the stream.
    source = audioCtx.createMediaStreamSource( stream );

    // Connect it to the destination to hear yourself (or any other node for processing!)
    source.connect( analyser );

    // volume meter, from https://ourcodeworld.com/articles/read/413/how-to-create-a-volume-meter-measure-the-sound-level-in-the-browser-with-javascript
    meter = createAudioMeter(audioCtx);
    source.connect(meter);
}

//navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
navigator.getUserMedia = navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia;
navigator.getUserMedia( {audio:true}, gotStream, function (){console.warn("Error getting audio stream from getUserMedia")} );

//javascript:(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//rawgit.com/mrdoob/stats.js/master/build/stats.min.js';document.head.appendChild(script);})()

// set up the scene
var scene = new THREE.Scene();

// set up the threejscamera to see the actual scene
var threejscamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
threejscamera.translateZ(1500);
scene.add(threejscamera);
threejscamera.position.x = -4000 + Math.random()*2000;
threejscamera.position.y = 1000;
// threejscamera.position.z = 500;

var cameracontrols = new THREE.OrbitControls( threejscamera );
cameracontrols.autoRotate = true;
cameracontrols.update();
cameracontrols.maxPolarAngle = Math.PI/2 - 0.1;

// set up the renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor( 0x000000, 0);
document.body.appendChild(renderer.domElement);

// make the canvas adaptable to the window screen
window.addEventListener('resize', function() {
  var width = window.innerWidth;
  var height = window.innerHeight;
  renderer.setSize(width, height);
  threejscamera.aspect = width / height;
  threejscamera.updateProjectionMatrix();
});

// GUI
var gui = new dat.GUI();
gui.add(window, 'sensitivity', 0, 30);

// Initialize the noise in threejs
var perlin = new ImprovedNoise();

// create the particle variable
var particlesCount = 200;
var particles = new THREE.Geometry();
// var particlesMaterial = new THREE.ParticleBasicMaterial({ color: 0xffffff, size: 2 });
var particlesMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 1.0,
  sizeAttenuation: false,
  size: 1
});

var redparticles = new THREE.Geometry();
// var particlesMaterial = new THREE.ParticleBasicMaterial({ color: 0xffffff, size: 2 });
var redparticlesMaterial = new THREE.PointsMaterial({
  color: 0xDE0000,
  transparent: true,
  opacity: 0.0,
  sizeAttenuation: false,
  size: 1
});

for (var i = 0; i < particlesCount; i++) {

  var px, py, pz;

  var lat = (i/particlesCount)*Math.PI;

  for (var j = 0; j < particlesCount; j++) {
    var lon = (j/particlesCount)*(Math.PI*2);

    var index = i*j+i;

    var particle = particles.vertices[index];

    var v = radius;// + dataArray[index%bufferLength];
    var n = Math.abs(perlin.noise(nx, ny));
    var vn = v*n;

    // console.log(n);

    px = vn * Math.sin(lat) * Math.cos(lon);
    py = vn * Math.sin(lat) * Math.sin(lon);
    pz = vn * Math.cos(lat);

    // add the particle to the array
    var particle = new THREE.Vector3(px, py, pz);
    particles.vertices.push(particle);

    v = radius*1.2;// + dataArray[index%bufferLength];
    n = Math.abs(perlin.noise(nx, ny));
    vn = v*n;

    // console.log(n);

    px = vn * Math.sin(lat) * Math.cos(lon);
    py = vn * Math.sin(lat) * Math.sin(lon);
    pz = vn * Math.cos(lat);

    // add the particle to the array
    var redparticle = new THREE.Vector3(px, py, pz);
    redparticles.vertices.push(redparticle);

    ny += .0004;
  }

  nx += .002;
}

// Create a new particle system with the particles and the material
var ParticleSystem = new THREE.Points(particles, particlesMaterial);
var RedParticleSystem = new THREE.Points(redparticles, redparticlesMaterial);

// Add the particle system to the scene
scene.add(ParticleSystem);
scene.add(RedParticleSystem);

// Floor
var geo = new THREE.PlaneBufferGeometry(20000, 20000, 8, 8);
var mat = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide });
var plane = new THREE.Mesh(geo, mat);

scene.add(plane);
plane.rotateX(-Math.PI/2);

// Lights
var light = new THREE.PointLight( 0x555555, 1, 10000, 2 );
scene.add( light );
light.position.set( 0, 1000, 0 );

// red light, connected to the red particle system
var redlight = new THREE.PointLight( 0xDE0000, .5, 20000, 2 );
scene.add( redlight );
redlight.position.set( 0, 1300, 0 );

// update function
var updateThreejs = function() {

  // get the waveform
  analyser.getByteTimeDomainData(dataArray);
  // get the frequencies
  analyser.getByteFrequencyData(frequencies);

  // first value of the perlin noise
  var noisx = 0;

  for (var i = 0; i < particlesCount; i++) {
    // latitude for the spherical coordinate system
    var lat = i/particlesCount*Math.PI;

    // second value for the perlin noise
    var noisy = 0;

    for (var j = 0; j < particlesCount; j++) {
      // longitude for the spherical coordinate system
      var lon = j/particlesCount*Math.PI;

      // Get the index of this particle
      var index = i+j*particlesCount;

      // get a copy of the particles
      var particle = particles.vertices[index];
      var redparticle = redparticles.vertices[index];

      // get the new values
      var v = radius + (dataArray[j]*sensitivity);
      var n = 0.5 + Math.abs(perlin.noise(noisx+nx, noisy+nx, 0));  // Apply the noise
      var vn = v*n;

      // Spherical coordinates
      var sinlat = Math.sin(lat);
      var coslat = Math.cos(lat);
      var coslon = Math.cos(lon);
      var sinlon = Math.sin(lon);

      particle.x = vn * sinlat * coslon;
      particle.y = vn * sinlat * sinlon;
      particle.z = vn * coslat;

      var v = radius + (frequencies[j]*sensitivity)*extmultiplier;
      var n = 0.5 + Math.abs(perlin.noise(noisx+nx, noisy+nx, 0));
      var vn = v*n;

      redparticle.x = vn * sinlat * coslon;
      redparticle.y = vn * sinlat * sinlon;
      redparticle.z = vn * coslat;

      noisy += .004;
    }

    noisx += .02;

  }

  // Move the noise with the master volume
  nx += meter.volume*0.1;
  particlesMaterial.size = 1+(meter.volume);  // Also the size of the particles
  redparticlesMaterial.size = 1+(meter.volume);

  // If the blinking is activated, show the particles alternatively
  if (blackflash) {
    if (frameCount%2 == 0) {
      particlesMaterial.opacity = .1 + (meter.volume*10);
      light.intensity = 1 + (meter.volume*10);
    } else {
      particlesMaterial.opacity = 0;
      light.intensiry = 0;
    }
  } else {
    particlesMaterial.opacity = .1 + (meter.volume*10);
    light.intensity = 1 + (meter.volume*10);
  }

  // if a bass frequency, probably the kick, is high, then activate some efects and do some randomizations
  if (frequencies[3] > 200) {
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

  // Increase the randomcounter, to reduce the chaos
  randomcounter++;

  // If it is activated, show the red particle system
  if (showred) {
    redparticlesMaterial.opacity = meter.volume*10;
    redlight.intensity = meter.volume*2;
  } else {
    redparticlesMaterial.opacity = 0;
    redlight.intensity = 0;
  }

  // Asensitivity, translate back the camera, modify the position variable, and put it back with the new value
  threejscamera.translateZ(-Math.sin(cameraz)*250);
  cameraz += .01;
  threejscamera.translateZ(Math.sin(cameraz)*250);

  // flag to the particle system and the lines geometry
  // that we've changed its vertices.
  particles.verticesNeedUpdate = true;
  redparticles.verticesNeedUpdate = true;

  cameracontrols.update();

  // keep the count of the frames, for the blinking option
  frameCount++;
};

// render function
var render = function() {
  // let's render the actual scene, first parameter is the scene, second the threejscamera
  renderer.render(scene, threejscamera);
};

// Game Loop function (update, render, repeat)
var drawThreejs = function() {

  requestAnimationFrame(drawThreejs);

  // update and render
  updateThreejs();
  render();
};

drawThreejs();
