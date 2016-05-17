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
  var startTime = new Date();
	var dataPoints1 = [];
  var dataPoints2 = [];
  var dataPoints3 = [];
  var dataLength = 500;
	var chart = new CanvasJS.Chart("chartContainer", {
			title : {
				text : "Random Data"
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

	var yVal1 = 15, yVal2 = 10, yVal3 = 20;
  var xVal = 0;
	function updateChart() {

		yVal1 = yVal1 + Math.round(5 + Math.random() * (-5 - 5));
    yVal2 = yVal2 + Math.round(5 + Math.random() * (-5 - 5));
    yVal3 = yVal3 + Math.round(5 + Math.random() * (-5 - 5));

    var now = new Date();
    secondsSinceStart = (now - startTime)/1000;
		dataPoints1.push({
			y : yVal1,
      x : secondsSinceStart
		});
    dataPoints2.push({
			y : yVal2,
      x : secondsSinceStart
		});
    dataPoints3.push({
			y : yVal3,
      x : secondsSinceStart
		});
    if (dataPoints1.length > dataLength)
    {
      dataPoints1.shift();
      dataPoints2.shift();
      dataPoints3.shift();
    }
    if(!pauseChart){
		  chart.render();
    }
    updateRate = parseFloat(document.getElementById("update_rate").value)
    console.log("updating at")
    console.log(Math.round(1000.0/updateRate));
    setTimeout(updateChart, Math.round(1000.0/updateRate));
	};
  updateChart();
}

function pause_chart(){
  pauseChart = !pauseChart;
}


// Subscribing to a Topic
// ----------------------

var listener = new ROSLIB.Topic({
  ros : ros,
  name : '/listener',
  messageType : 'std_msgs/String'
});

listener.subscribe(function(message) {
  console.log('Received message on ' + listener.name + ': ' + message.data);
  listener.unsubscribe();
});

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
