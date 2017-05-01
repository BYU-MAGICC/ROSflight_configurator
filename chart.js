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


// Data for Plots
var acc_x = {label: 'acc_x', values: []}
    // acc_y = {label: 'cos', values: []},
    // acc_z = {label: 'cos', values: []}
var last_time = 0

var chart = $('#lineChart').epoch({
  type: 'time.line',
  data: [acc_x],
  historySize: 20,
  queueSize: 1,
  axes: ['right', 'bottom', 'left'] 
});


// Loading data for plotting
window.onload = function () {
  var imu_listener = new ROSLIB.Topic({
    ros : ros,
    name : '/imu/data',
    messageType : 'sensor_msgs/Imu'
  });

  imu_listener.subscribe(function(msg) {
    var now = msg.header.stamp.secs + msg.header.stamp.nsecs*1.0e-9;
    if (now > last_time + 0.01)
    {
      chart.push([{time: now, y: msg.linear_acceleration.x}]);
      last_time = now
    }
  });
}