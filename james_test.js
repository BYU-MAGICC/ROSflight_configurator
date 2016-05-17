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

var linear_x = 0.0;
var linear_y = 0.0;
var linear_z = 0.0;
var angular_x = 0.0;
var angular_y = 0.0;
var angular_z = 0.0;
var updateRate = 100.0;
var pauseChart = false;
var dataPoints1 = [];
var dataPoints2 = [];
var dataPoints3 = [];
var dataLength = 500;
var startTime = new Date();

var acc_x = 0.0, acc_y = 0.0, acc_z = 0.0;
var gyro_x = 0.0, gyro_y = 0.0, gyro_z = 0.0;

function twist_button_callback(){
  console.log("getting values");
  linear_x = parseFloat(document.getElementById("linear_x").value);
  linear_y = parseFloat(document.getElementById("linear_y").value);
  linear_z = parseFloat(document.getElementById("linear_z").value);
  angular_x = parseFloat(document.getElementById("angular_x").value);
  angular_y = parseFloat(document.getElementById("angular_y").value);
  angular_z = parseFloat(document.getElementById("angular_z").value);
   console.log("got values");
}

// Publishing a Topic
// ------------------
function publish_twist(){
  var cmdVel = new ROSLIB.Topic({
    ros : ros,
    name : '/cmd_vel',
    messageType : 'geometry_msgs/Twist'
  });

  var twist = new ROSLIB.Message({
    linear : {
      x : linear_x,
      y : linear_y,
      z : linear_z
    },
    angular : {
      x : angular_x,
      y : angular_y,
      z : angular_z
    }
  });
  cmdVel.publish(twist);
  setTimeout(publish_twist, 10);
}
publish_twist();

// Plotting data
// -------------
window.onload = function () {
	var chart = new CanvasJS.Chart("chartContainer", {
			title : {
				text : "Accelerometer Data"
			},
      axisX :{
        gridColor: "lightblue",
        gridThickness: 1
      },
			data : [{
					type : "line",
					dataPoints : dataPoints1
				},
        {
          type: "line",
          dataPoints : dataPoints2
        },
        {
          type: "line",
          dataPoints : dataPoints3
        }

			]
		});

	chart.render();

  function updateAccChart() {

    var now = new Date();
    secondsSinceStart = (now - startTime)/1000;
    dataPoints1.push({
      y : acc_x,
      x : secondsSinceStart
    });
    dataPoints2.push({
      y : acc_y,
      x : secondsSinceStart
    });
    dataPoints3.push({
      y : acc_z,
      x : secondsSinceStart
    });
    while (dataPoints1.length > dataLength)
    {
      dataPoints1.shift();
      dataPoints2.shift();
      dataPoints3.shift();
    }
    if(!pauseChart){
      chart.render();
    }
  };

  // Subscribing to a Topic
  // ----------------------

  var listener = new ROSLIB.Topic({
    ros : ros,
    name : '/mikey/imu/data',
    messageType : 'sensor_msgs/Imu'
  });

  listener.subscribe(function(message) {
    console.log('Received message on ' + listener.name);
    acc_x = message.linear_acceleration.x;
    acc_y = message.linear_acceleration.y;
    acc_z = message.linear_acceleration.z;
    gyro_x = message.angular_velocity.x;
    gyro_y = message.angular_velocity.y;
    gyro_z = message.angular_velocity.z;
    updateAccChart();
  });

}



function pause_chart(){
  pauseChart = !pauseChart;
}




// Calling a service
// -----------------

var addTwoIntsClient = new ROSLIB.Service({
  ros : ros,
  name : '/add_two_ints',
  serviceType : 'rospy_tutorials/AddTwoInts'
});

var request = new ROSLIB.ServiceRequest({
  a : 1,
  b : 2
});

addTwoIntsClient.callService(request, function(result) {
  console.log('Result for service call on '
    + addTwoIntsClient.name
    + ': '
    + result.sum);
});

// Getting and setting a param value
// ---------------------------------

ros.getParams(function(params) {
  console.log(params);
});

var maxVelX = new ROSLIB.Param({
  ros : ros,
  name : 'max_vel_y'
});

maxVelX.set(0.8);
maxVelX.get(function(value) {
  console.log('MAX VAL: ' + value);
});
