let cameracontrols;
let cameraz = 0;

const initCamera = function() {
  cameracontrols = new THREE.OrbitControls(threejscamera);
  cameracontrols.autoRotate = true;
  cameracontrols.update();
  cameracontrols.maxPolarAngle = Math.PI/2 - 0.1;
}

const updateCamera = function() {
    if (cameracontrols != undefined) {
        cameracontrols.update();
        // Translate back the camera, modify the position variable, and put it back with the new value
        threejscamera.translateZ(-Math.sin(cameraz)*250);
        cameraz += .01;
        threejscamera.translateZ(Math.sin(cameraz)*250);
    }   
}
