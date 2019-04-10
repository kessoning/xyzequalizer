let nx = 0;
let ny = 0;
let radius = 20;

// create the particle variable
let particlesCount = 200;
// geometries
let particles, redparticles;
// materials
let particlesMaterial, redparticlesMaterial;
// Objects
let ParticleSystem, RedParticleSystem;

// Initialize the noise in threejs
const perlin = new ImprovedNoise();

const initSphere = function() {
  particles = new THREE.Geometry();
  particlesMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 1.0,
    sizeAttenuation: false,
    size: 1
  });
  
  redparticles = new THREE.Geometry();
  redparticlesMaterial = new THREE.PointsMaterial({
    color: 0xDE0000,
    transparent: true,
    opacity: 0.0,
    sizeAttenuation: false,
    size: 1
  });
  
  initCoordinates();
  
  // Create a new particle system with the particles and the material  
  ParticleSystem = new THREE.Points(particles, particlesMaterial);
  RedParticleSystem = new THREE.Points(redparticles, redparticlesMaterial);

  // Add the particle system to the scene
  scene.add(ParticleSystem);
  scene.add(RedParticleSystem);
}

const initCoordinates = function() {
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
}

const updateSphere = function() {
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
  
  // flag to the particle system and the lines geometry
  // that we've changed its vertices.
  particles.verticesNeedUpdate = true;
  redparticles.verticesNeedUpdate = true;
}
