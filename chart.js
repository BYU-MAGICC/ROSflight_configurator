// Connecting to ROS
// -----------------

var ros = new ROSLIB.Ros({
  url: 'ws://localhost:9090'
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

// Subscribe to and handle ROS messages
var acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z;
window.onload = function() {
  var imu_listener = new ROSLIB.Topic({
    ros: ros,
    name: '/imu/data',
    messageType: 'sensor_msgs/Imu'
  });

  imu_listener.subscribe(function(msg) {
    acc_x = msg.linear_acceleration.x;
    acc_y = msg.linear_acceleration.y;
    acc_z = msg.linear_acceleration.z;
    gyro_x = msg.linear_acceleration.x;
    gyro_y = msg.linear_acceleration.y;
    gyro_z = msg.linear_acceleration.z;
  });
}

var tv = 2;

// instantiate our graph!
var graph = new Rickshaw.Graph({
  element: document.getElementById("chart"),
  width: 1200,
  height: 400,
  renderer: 'line',
  min: 'auto',
  series: new Rickshaw.Series.FixedDuration([{
    name: 'acc_x'
  }, {
    name: 'acc_y'
  }, {
    name: 'acc_z'
  }], undefined, {
    timeInterval: tv,
    maxDataPoints: 2.0*1000/tv,
    timeBase: new Date().getTime() / 1000
  })

});
graph.render();

var xAxis = new Rickshaw.Graph.Axis.Time({
    graph: graph,
    timeFixture: new Rickshaw.Fixtures.Time.Local()
});
xAxis.render();

var y_ticks = new Rickshaw.Graph.Axis.Y( {
  graph: graph,
  orientation: 'left',
  tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
  element: document.getElementById('y_axis')
} );




// add some data every so often

var i = 0;
var iv = setInterval(function() {

  var data = {
    one: acc_x
  };
  data.two = acc_y
  data.three = acc_z;

  graph.series.addData(data);
  graph.update();

}, tv);