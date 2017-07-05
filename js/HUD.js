// Connecting to ROS
// -----------------

var ros = new ROSLIB.Ros({
  url : 'ws://localhost:9090'
});

ros.on('connection', function() {
  console.log('Connected to websocket server.');
});

ros.on('error', function(error) {
  console.log('Error connecting to websocket server: ', error);
});

ros.on('close', function() {
  console.log('Connection to websocket server closed.');
});

var armed_state = 0
var failsafe_state = 0
var rc_override = 0
var unsaved_parameters = 0
var attitude_quaternion = new THREE.Quaternion(0, 0, 0, 1)

// Display Status of Aircraft
function display_status(){
	if (armed_state)
	{
		document.getElementById('armed_text').value = "ARMED";
	}
	else
	{
		document.getElementById("armed_text").value = "DISARMED";
	}

	if (failsafe_state)
	{
		document.getElementById("failsafe_text").value = "FAILSAFE";
	}
	else
	{
		document.getElementById("failsafe_text").value = "";	
	}

	if (rc_override)
	{
		document.getElementById("rc_override_text").value = "ACTIVE"
	}
	else
	{
		document.getElementById("rc_override_text").value = "INACTIVE"	
	}

	if (unsaved_parameters)
	{
		document.getElementById("unsaved_parameters").value = "UNSAVED PARAMETERS"
	}
	else
	{
		document.getElementById("unsaved_parameters").value = ""	
	}


	setTimeout(display_status, 10);
}
display_status();

// Subscribe to and handle ROS messages
window.onload = function () {
  var status_listener = new ROSLIB.Topic({
    ros : ros,
    name : '/status',
    messageType : 'rosflight_msgs/Status'
  });

  status_listener.subscribe(function(message) {
    armed_state = message.armed
    failsafe_state = message.failsafe
    rc_override = message.rc_override
    I2C_errors = message.i2c_errors
    loop_time = message.loop_time_us
  });

  var unsaved_parameters_listener = new ROSLIB.Topic({
  	ros : ros,
  	name : '/unsaved_params',
  	messageType : 'std_msgs/Bool'
  });

  unsaved_parameters_listener.subscribe(function(message) {
  	unsaved_parameters = message.data
  });

  var attitude_listener = new ROSLIB.Topic({
  	ros : ros,
  	name : '/attitude',
  	messageType: 'rosflight_msgs/Attitude'
  });

  attitude_listener.subscribe(function(message) {
  	attitude_quaternion.w = message.attitude.w;
  	attitude_quaternion.x = message.attitude.x;
  	attitude_quaternion.y = message.attitude.y;
  	attitude_quaternion.z = message.attitude.z;
  })
}


// Set up the scene, camera, and renderer as global variables.
var scene, camera, renderer;
var mesh;

init();
animate();

// Sets up the scene.
function init() { 
	scene = new THREE.Scene();

	var WIDTH = window.innerWidth,
      HEIGHT = window.innerHeight;

  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(WIDTH, HEIGHT);

  // Add the renderer to the DOM
  container = document.getElementById('attitude_div');
  container.appendChild( renderer.domElement );


	// Create a camera, zoom it out from the model a bit, and add it to the scene.
  camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 20000);
  camera.position.set(0,0,8)
  scene.add(camera);

  // Dynamic Resizing
  window.addEventListener('resize', function() {
    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
  });

  // Load the 3D model to display
  var loader = new THREE.JSONLoader();
  loader.load( "models/quadcopter.json", function(geometry, materials){
    var material = new THREE.MeshFaceMaterial(materials);
    mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(0.6, 0.6, 0.6	)
    scene.add(mesh);
  });

  // Set the background color of the scene.
  renderer.setClearColor(0x333F47, 1);
 
  // Create a light, set its position, and add it to the scene.
  var light = new THREE.PointLight(0xffffff);
  light.position.set(-100,200,100);
  scene.add(light);

  window.addEventListener( 'resize', onWindowResize, false );
}


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

// Renders the scene and updates the render as needed.
function animate() {
  requestAnimationFrame( animate );
  // Rotate the quaternion into the correct coordinate frame (EUN) <-- (discovered through experimentation)
  mesh.quaternion.set(attitude_quaternion.y, -attitude_quaternion.z, -attitude_quaternion.x, attitude_quaternion.w);
  renderer.render( scene, camera );
}