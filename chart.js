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
var acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z, baro;
var mag_x, mag_y, mag_z;
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
    gyro_x = msg.angular_velocity.x;
    gyro_y = msg.angular_velocity.y;
    gyro_z = msg.angular_velocity.z;
  });

  var baro_listener = new ROSLIB.Topic({
    ros: ros,
    name: '/baro',
    messageType: 'fcu_common/Barometer'
  });

  baro_listener.subscribe(function(msg) {
    baro = msg.altitude;
  });

  var mag_listener = new ROSLIB.Topic({
    ros: ros,
    name: '/magnetometer',
    messageType: 'sensor_msgs/MagneticField'
  });

  mag_listener.subscribe(function(msg) {
    mag_x = msg.magnetic_field.x;
    mag_y = msg.magnetic_field.y;
    mag_z = msg.magnetic_field.z;
  });
}

var tv = 1/60 * 1000;
var plot_height = 200;
var plot_width = 800;
var num_data_points = 180;


//-------------------------------------------------
// ACCELEROMETER
var acc_graph = new Rickshaw.Graph({
  element: document.getElementById("acc_chart"),
  width: plot_width,
  height: plot_height,
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
    maxDataPoints: num_data_points,
    timeBase: new Date().getTime() / 1000
  })

});
acc_graph.render();

var xAxis = new Rickshaw.Graph.Axis.Time({
    graph: acc_graph,
    timeFixture: new Rickshaw.Fixtures.Time.Local()
});
xAxis.render();

var y_ticks = new Rickshaw.Graph.Axis.Y( {
  graph: acc_graph, 
  orientation: 'left',
  tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
  element: document.getElementById('acc_y_axis')
} );

function calibrate_imu() {
  var imu_srv = new ROSLIB.Service({
    ros: ros,
    name: '/calibrate_imu',
    serviceType: 'std_srvs/Trigger'
  });
  var request = new ROSLIB.ServiceRequest({});
  imu_srv.callService(request, function(result){
    console.log("calibrating IMU");
  });
};


//-------------------------------------------------
// GYRO
var gyro_graph = new Rickshaw.Graph({
  element: document.getElementById("gyro_chart"),
  width: plot_width,
  height: plot_height,
  renderer: 'line',
  min: 'auto',
  series: new Rickshaw.Series.FixedDuration([{
    name: 'gyro_x'
  }, {
    name: 'gyro_y'
  }, {
    name: 'gyro_z'
  }], undefined, {
    timeInterval: tv,
    maxDataPoints: num_data_points,
    timeBase: new Date().getTime() / 1000
  })

});
gyro_graph.render();

var xAxis = new Rickshaw.Graph.Axis.Time({
    graph: gyro_graph,
    timeFixture: new Rickshaw.Fixtures.Time.Local()
});
xAxis.render();

var y_ticks = new Rickshaw.Graph.Axis.Y( {
  graph: gyro_graph, 
  orientation: 'left',
  tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
  element: document.getElementById('gyro_y_axis')
} );

//-------------------------------------------------
// Baro
var baro_graph = new Rickshaw.Graph({
  element: document.getElementById("baro_chart"),
  width: plot_width,
  height: plot_height,
  renderer: 'line',
  min: 'auto',
  series: new Rickshaw.Series.FixedDuration([{
    name: 'baro' }], undefined, {
    timeInterval: tv,
    maxDataPoints: num_data_points,
    timeBase: new Date().getTime() / 1000
  })

});
baro_graph.render();

var xAxis = new Rickshaw.Graph.Axis.Time({
    graph: baro_graph,
    timeFixture: new Rickshaw.Fixtures.Time.Local()
});
xAxis.render();

var y_ticks = new Rickshaw.Graph.Axis.Y( {
  graph: baro_graph, 
  orientation: 'left',
  tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
  element: document.getElementById('baro_y_axis')
} );

//-------------------------------------------------
// Magnetometer
var mag_graph = new Rickshaw.Graph({
  element: document.getElementById("mag_chart"),
  width: plot_width,
  height: plot_height,
  renderer: 'line',
  min: 'auto',
  series: new Rickshaw.Series.FixedDuration([{
    name: 'mag_x'
  }, {
    name: 'mag_y'
  }, {
    name: 'mag_z'
  }], undefined, {
    timeInterval: tv,
    maxDataPoints: num_data_points,
    timeBase: new Date().getTime() / 1000
  })

});
mag_graph.render();

var xAxis = new Rickshaw.Graph.Axis.Time({
    graph: baro_graph,
    timeFixture: new Rickshaw.Fixtures.Time.Local()
});
xAxis.render();

var y_ticks = new Rickshaw.Graph.Axis.Y( {
  graph: baro_graph, 
  orientation: 'left',
  tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
  element: document.getElementById('mag_y_axis')
} );




//-------------------------------------------------
// Render Update Loop
var i = 0;
var iv = setInterval(function() {

  var acc_data = {
    one: acc_x
  };
  acc_data.two = acc_y
  acc_data.three = acc_z;
  acc_graph.series.addData(acc_data);
  acc_graph.update();

  var gyro_data = {
    one: gyro_x
  };
  gyro_data.two = gyro_y
  gyro_data.three = gyro_z;
  gyro_graph.series.addData(gyro_data);
  gyro_graph.update();

  var baro_data = { 
    one: baro 
  };
  baro_graph.series.addData(baro_data);
  baro_graph.update();

  var mag_data = {
    one: mag_x
  };
  mag_data.two = mag_y
  mag_data.three = mag_z;
  mag_graph.series.addData(mag_data);
  mag_graph.update();
}, tv);