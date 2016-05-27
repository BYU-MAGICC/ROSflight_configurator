// Connecting to ROS
// -----------------

var ros = new ROSLIB.Ros({
  url : 'ws://192.168.1.2:9090'
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

var setParamClient = new ROSLIB.Service({
  ros :ros,
  name : 'param_set',
  serviceType : 'fcu_io/ParamSet'
});

var saveParamClient = new ROSLIB.Service({
  ros :ros,
  name : 'param_write',
  serviceType : 'std_srvs/Empty'
});

function twist_button_callback(){
  linear_x = parseFloat(document.getElementById("linear_x").value);
  linear_y = parseFloat(document.getElementById("linear_y").value);
  linear_z = parseFloat(document.getElementById("linear_z").value);
  angular_x = parseFloat(document.getElementById("angular_x").value);
  angular_y = parseFloat(document.getElementById("angular_y").value);
  angular_z = parseFloat(document.getElementById("angular_z").value);
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
	var accChart = new CanvasJS.Chart("accChartContainer", {
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

	accChart.render();

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
      accChart.render();
    }
  };

  var listener = new ROSLIB.Topic({
    ros : ros,
    name : '/imu/data',
    messageType : 'sensor_msgs/Imu'
  });

  listener.subscribe(function(message) {
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

function set_param(){
  var param_set_caller = new ROSLIB.ServiceRequest({
    param_id : document.getElementById("param_id").value,
    param_type : 6,
    integer_value : parseInt(document.getElementById("param_value").value),
    unsigned_value : 0,
    float_value : 0.0
  })
  setParamClient.callService(param_set_caller)
}

function save_params(){
  var save_param_message = new ROSLIB.ServiceRequest({})
  saveParamClient.callService(save_param_message)
}



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
