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

// var linear_x = 0.0;
// var linear_y = 0.0;
// var linear_z = 0.0;
// var angular_x = 0.0;
// var angular_y = 0.0;
// var angular_z = 0.0;
// var updateRate = 100.0;
// var pauseChart = false;
// var dataPoints1 = [];
// var dataPoints2 = [];
// var dataPoints3 = [];
// var dataLength = 500;
// var startTime = new Date();

// var acc_x = 0.0, acc_y = 0.0, acc_z = 0.0;
// var gyro_x = 0.0, gyro_y = 0.0, gyro_z = 0.0;

var armed_state = 0
var failsafe_state = 0
var rc_override = 0
var unsaved_parameters = 0

var attitude_quaternion = new THREE.Quaternion(0, 0, 0, 1)







// var setParamClient = new ROSLIB.Service({
//   ros :ros,
//   name : 'param_set',
//   serviceType : 'fcu_io/ParamSet'
// });

// var saveParamClient = new ROSLIB.Service({
//   ros :ros,
//   name : 'param_write',
//   serviceType : 'std_srvs/Empty'
// });

// function twist_button_callback(){
//   linear_x = parseFloat(document.getElementById("linear_x").value);
//   linear_y = parseFloat(document.getElementById("linear_y").value);
//   linear_z = parseFloat(document.getElementById("linear_z").value);
//   angular_x = parseFloat(document.getElementById("angular_x").value);
//   angular_y = parseFloat(document.getElementById("angular_y").value);
//   angular_z = parseFloat(document.getElementById("angular_z").value);
// }

// Publishing a Topic
// ------------------
// function publish_twist(){
//   var cmdVel = new ROSLIB.Topic({
//     ros : ros,
//     name : '/cmd_vel',
//     messageType : 'geometry_msgs/Twist'
//   });

//   var twist = new ROSLIB.Message({
//     linear : {
//       x : linear_x,
//       y : linear_y,
//       z : linear_z
//     },
//     angular : {
//       x : angular_x,
//       y : angular_y,
//       z : angular_z
//     }
//   });
//   cmdVel.publish(twist);
//   setTimeout(publish_twist, 10);
// }
// publish_twist();

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

// Plotting data
// -------------
window.onload = function () {
  var status_listener = new ROSLIB.Topic({
    ros : ros,
    name : '/status',
    messageType : 'fcu_common/Status'
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
  	messageType: 'fcu_common/Attitude'
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
	// Camera
	// camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
	// camera.position.z = 000;
	// camera.position.x = -400;
	// camera.rotation.y = -Math.PI/2.0;
	// camera.rotation.x = -Math.PI/2.0;
	// 
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

    var loader = new THREE.JSONLoader();

    // loader.load( "models/treehouse_logo.js", function(geometry, materials){
   	// var material = new THREE.MeshLambertMaterial({color: 0x55B663});
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
  mesh.quaternion.set(attitude_quaternion.y, -attitude_quaternion.z, -attitude_quaternion.x, attitude_quaternion.w);
  renderer.render( scene, camera );
}

// function pause_chart(){
//   pauseChart = !pauseChart;
// }

// function set_param(){
//   var param_set_caller = new ROSLIB.ServiceRequest({
//     param_id : document.getElementById("param_id").value,
//     param_type : 6,
//     integer_value : parseInt(document.getElementById("param_value").value),
//     unsigned_value : 0,
//     float_value : 0.0
//   })
//   setParamClient.callService(param_set_caller)
// }

// function save_params(){
//   var save_param_message = new ROSLIB.ServiceRequest({})
//   saveParamClient.callService(save_param_message)
// }



// // Getting and setting a param value
// // ---------------------------------
// ros.getParams(function(params) {
//   console.log(params);
// });

// var maxVelX = new ROSLIB.Param({
//   ros : ros,
//   name : 'max_vel_y'
// });

// maxVelX.set(0.8);
// maxVelX.get(function(value) {
//   console.log('MAX VAL: ' + value);
// });
