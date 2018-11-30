var renderer,
  scene,
  camera,
  camPos = 100,
  controls,
  winframe,
  light,
  dist = 0,
  depth = 0,
  verticesX = [],
  verticesY = [],
  barVerticesY = [];
var tubeWidth = 7,
  initialTubeRadius = 2,
  tubeFaceNum = 3;
var frameSides = 4,
  frameTexture,
  wall,
  frameNormalMap,
  frameBumpMap;

console.log("helloworld");
initial();
animate();

function initial() {
  // renderer
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;
  document.getElementById("parent_frame").appendChild(renderer.domElement);

  // scene
  scene = new THREE.Scene();

  // camera
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    500
  );
  camera.position.set(0, 0, camPos);
  scene.add(camera);
  
  //var controls = new THREE.OrbitControls(camera);

  // light
  addLight();
  addFrame();
  addBar();
  addWall();
  fullSize();
}
function addLight(){
    // White directional light at half intensity shining from the top.
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.2 );
    directionalLight.position.set(5,-10,15);
  scene.add( directionalLight );

  spotLight = new THREE.PointLight(0xffffff, 1, 100);
  spotLight.castShadow = true;
  ambiLight = new THREE.AmbientLight(0xffffff, 0.3, 10);
  scene.add(spotLight);
  spotLight.position.x = 0;
  spotLight.position.y = 30;
  spotLight.position.z = -40;
  scene.add(ambiLight);
}
function addFrame() {
  var geometry = new THREE.TorusGeometry(
    initialTubeRadius,
    tubeWidth,
    tubeFaceNum,
    frameSides
  );

  var materials = [
    new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load(
        "https://static.vecteezy.com/system/resources/previews/000/125/950/non_2x/vector-wood-texture.jpg"
      ),
      side: THREE.DoubleSide,
      bumpMap: new THREE.TextureLoader().load(
        "https://static.vecteezy.com/system/resources/previews/000/125/950/non_2x/vector-wood-texture.jpg"
      ),
      normalMap: new THREE.TextureLoader().load(
        "https://static.vecteezy.com/system/resources/previews/000/125/950/non_2x/vector-wood-texture.jpg"
      ),
      flatShading: THREE.SmoothShading
    })
  ];

  // winframe
  winframe = new THREE.Mesh(geometry, materials);
  winframe.position.set(0, 0, 0);
  winframe.recieveShadow = true;
  winframe.casrShadow = true;
  rotateTorus(winframe, tubeFaceNum, frameSides);

  dist = camera.position.z - depth;
  scene.add(winframe);
}

function addBar() {
  bar = new THREE.Mesh(
    new THREE.BoxGeometry(tubeWidth/2, tubeWidth, tubeWidth*1.3),
    new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load(
        "https://static.vecteezy.com/system/resources/previews/000/125/950/non_2x/vector-wood-texture.jpg"
      ),
      side: THREE.DoubleSide,
      bumpMap: new THREE.TextureLoader().load(
        "https://static.vecteezy.com/system/resources/previews/000/125/950/non_2x/vector-wood-texture.jpg"
      ),      
      normalMap: new THREE.TextureLoader().load(
        "https://static.vecteezy.com/system/resources/previews/000/125/950/non_2x/vector-wood-texture.jpg"
      ),
      flatShading: THREE.SmoothShading
    })
  );
  bar.position.set(0, 0, 0);
  bar.recieveShadow = true;
  bar.castShadow = true;
  scene.add(bar);
  for (var j = 0; j < 8; j++) {
    barVerticesY.push(bar.geometry.vertices[j].y);
  }
}
function rotateTorus(torus, tubeFaceNum, frameSides){
  var theta = Math.PI / 4;
  for (var j = 0; j < tubeFaceNum * frameSides; j++) {
    var tempx =
      Math.cos(theta) * torus.geometry.vertices[j].x +
      Math.sin(theta) * torus.geometry.vertices[j].y;
    var tempy =
      -Math.sin(theta) * torus.geometry.vertices[j].x +
      Math.cos(theta) * torus.geometry.vertices[j].y;
    torus.geometry.vertices[j].x = tempx;
    torus.geometry.vertices[j].y = tempy;
    verticesX.push(torus.geometry.vertices[j].x);
    verticesY.push(torus.geometry.vertices[j].y);

    if (depth < torus.geometry.vertices[j].z) {
      depth = torus.geometry.vertices[j].z;
    }
  }
}
function addWall(){                                               
  var geometry = new THREE.TorusGeometry( 10, 1, 2, 4 );
  var material = new THREE.MeshPhongMaterial( {color: 0xFFE8BB } );
  wall = new THREE.Mesh( geometry, material );
  scene.add( wall );  
  rotateTorus(wall,2,4);
 }
function fullSize() {
  var vFov = camera.fov * Math.PI / 180;
  var planeHeightAtDist = 2 * Math.tan(vFov / 2) * dist;
  var planeWidthAtDist = planeHeightAtDist * camera.aspect;
  var widthChange = planeWidthAtDist / 2 - tubeWidth / 1.5;
  var heightChange = planeHeightAtDist / 2 - tubeWidth /1.5;
  var i = 1;
  for (var j = 0; j < tubeFaceNum * frameSides; j += 2) {
    winframe.geometry.vertices[j].x = verticesX[j] + widthChange * i;
    winframe.geometry.vertices[j + 1].x = verticesX[j + 1] + widthChange * i;
    winframe.geometry.vertices[j + 1].y = verticesY[j + 1] + heightChange * i;
    i *= -1;
    winframe.geometry.vertices[j].y = verticesY[j] + heightChange * i;
  }
  var stretch = 0;
  stretchFrame(heightChange,stretch);  
  stretchWall(widthChange, heightChange);
}
function stretchWall(w,h){
  var i = 1;
  for(var j = 0 ; j < 4; j+=2){    
    wall.geometry.vertices[j].x = i*window.innerWidth/2;
    wall.geometry.vertices[j+4].x += i*w;
    wall.geometry.vertices[j].y = -i*window.innerHeight/2;
    wall.geometry.vertices[j+4].y = -i*h;
    wall.geometry.vertices[j+1].x = i*window.innerWidth/2;
    wall.geometry.vertices[j+5].x += i*w;
    wall.geometry.vertices[j+1].y = i*window.innerHeight/2;
    wall.geometry.vertices[j+5].y = i*h;
    i = -1;    
  }  
}
function stretchFrame(heightChange, stretch){
  var i = 1;
 for (var j = 0; j < frameSides; j+=2) {
    winframe.geometry.vertices[j].x += stretch *i;
    winframe.geometry.vertices[j].y += stretch *-i;
    winframe.geometry.vertices[j+1].x += stretch *i;
    winframe.geometry.vertices[j+1].y += stretch *i;
    i = -1;
  }

  bar.geometry.vertices[0].y = barVerticesY[0] + heightChange-tubeWidth/2;
  bar.geometry.vertices[1].y = barVerticesY[1] + heightChange-tubeWidth/2;
  bar.geometry.vertices[4].y = barVerticesY[4] + heightChange-tubeWidth/2;
  bar.geometry.vertices[5].y = barVerticesY[5] + heightChange-tubeWidth/2;
  bar.geometry.vertices[6].y = barVerticesY[6] - heightChange+tubeWidth/2;
  bar.geometry.vertices[7].y = barVerticesY[7] - heightChange+tubeWidth/2;
  bar.geometry.vertices[2].y = barVerticesY[2] - heightChange+tubeWidth/2;
  bar.geometry.vertices[3].y = barVerticesY[3] - heightChange+tubeWidth/2;
}
function animate() {
  requestAnimationFrame(animate);
  update();
  render();
}
// Game Logic
function update() {
  var time = Date.now() * 0.0005;
 /*
  spotLight.position.x = Math.sin(time * 1) * 5;
  spotLight.position.y = Math.cos(time * 1) * 15;
  spotLight.position.z = Math.sin(time * 1) * 2;
*/
  var scale = 1;
  var X = localStorage.getItem("X")*scale;
  var Y = localStorage.getItem("Y")*scale;
  var Z = localStorage.getItem("Z")*scale+10;

  if (X != null && Y != null && Z != null) {
    //console.log(X + ", " + Y + ", " + Z);
	lookAt(X,Y,Z);
	moveTo(X,Y,Z);
  }
  //console.log( winframe.rotation.y );;
}
function lookAt(X,Y,Z){
	winframe.lookAt(-X,-Y,Z);
	bar.lookAt(-X,-Y,Z);
	wall.lookAt(-X,-Y,Z);	
}
function moveTo(X,Y,Z){
	winframe.position.set(winframe.position.x, winframe.position.y, winframe.position.z);
	bar.position.set(bar.position.x, bar.position.y, bar.position.z);
	wall.position.set(wall.position.x, wall.position.y, wall.position.z);
}
// Draw Scene
function render() {
  renderer.render(scene, camera);
}
