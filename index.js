
var lt = 37.317710;
var lon = -122.028933;

var map;

var lt2 = 0;
var lon2 = 0;

var config = {
    apiKey: "AIzaSyDjmaq2SZIPapnleYQiBRwe18-agzYdcW0",
    authDomain: "distress-b9829.firebaseapp.com",
    databaseURL: "https://distress-b9829.firebaseio.com",
    storageBucket: "distress-b9829.appspot.com",
  };

$(document).ready(function() {
  firebase.initializeApp(config);

  $(".alert").click(function() {
    var d = new Date();
    firebase.database().ref("alerts").push({
      lon: lon,
      lat: lt,
      time: d.getHours() + ":" + d.getMinutes(),
      date: d.getMonth() + "/" + d.getDate() + "/" + d.getFullYear()
    });
    Materialize.toast("Alert was sent", 4000);
  });

  $(".req").click(function() {
    var dest = $("#loc").val();
    $("#loc").val("");
    $(".request").click();

    var t = 0;
    var savRef = firebase.database().ref("savior");
    savRef.once("value").then(function (snapshot){
      var saviors = snapshot.val();
      var short = 100000.00;
      var name;
      snapshot.forEach(function (sav) {
        var longitude = parseFloat(sav.child("long").val());
        var latitude = parseFloat(sav.child("lat").val());
        if(longitude != null && latitude != null) {
          var x = Math.abs(longitude - lon);
          var y = Math.abs(latitude - lt);
          d = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
          if(short > d) {
            short = d;
            name = sav.child("name").val();
          }
        }
      });
      t = Math.ceil(short * 1380);
      Materialize.toast('A savior is headed to your location. will arrive in approximately ' + t + ' minutes.', 4000);
      firebase.database().ref("savior/" + name + "/requested").set(true);
    });

  });
});

function initMap() {
  // Create a map object and specify the DOM element for display.
  var alertPts = [];

  firebase.database().ref("alerts").once("value").then(function(snapshot) {
    snapshot.forEach(function(alert) {
      var lo = alert.child("lon").val();
      var la = alert.child("lat").val();
      alertPts.push(new google.maps.LatLng(la, lo));
    });
  });

  navigator.geolocation.getCurrentPosition(function(position) {
    lt = position.coords.latitude;
    lon = position.coords.longitude;
  });
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: lt, lng: lon},
    scrollwheel: false,
    zoom: 15
  });

  var savRef = firebase.database().ref("savior");
  savRef.once("value").then(function (snapshot){
    var saviors = snapshot.val();
    snapshot.forEach(function (sav) {
      var longitude = parseFloat(sav.child("long").val());
      var latitude = parseFloat(sav.child("lat").val());
      if(longitude != null && latitude != null) {
        var myLatLng = {lat: latitude, lng: longitude};

        var marker = new google.maps.Marker({
          map: map,
          position: myLatLng,
          title: sav.child("name").val()
        });
      }
    });
  });

  var heatmap = new google.maps.visualization.HeatmapLayer({
    data: alertPts
  });
  heatmap.setMap(map);
}
