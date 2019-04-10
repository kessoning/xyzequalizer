let light, redlight;

const initLights = function() {
  light = new THREE.PointLight( 0x555555, 1, 10000, 2 );
  scene.add( light );
  light.position.set( 0, 1000, 0 );

  // red light, connected to the red particle system
  redlight = new THREE.PointLight( 0xDE0000, .5, 20000, 2 );
  scene.add( redlight );
  redlight.position.set( 0, 1300, 0 );
}

const updateLights = function() {
  if (showred) {
    redparticlesMaterial.opacity = meter.volume*10;
    redlight.intensity = meter.volume*2;
  } else {
    redparticlesMaterial.opacity = 0;
    redlight.intensity = 0;
  }
}
