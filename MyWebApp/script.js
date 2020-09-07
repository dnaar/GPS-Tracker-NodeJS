var map;
var markers = [];

async function iniciarMap() {
  const _location = await getData();
  const coord = { lat: _location[0], lng: _location[1] };
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 18,
    center: coord
  });
  marker = new google.maps.Marker({
    position: coord,
    map: map
  });
  markers[0] = marker;
  await updateMarker();
}

async function getData() {
  const _location = [];
  const response = await fetch('coordinates.csv')
  const data = await response.text();
  const rows = data.split('\n').slice(1, 2);
  rows.forEach(elt => {
    const row = elt.split(',');
    const latitud = row[1];
    _location.push(parseFloat(latitud));
    const longitud = row[2];
    _location.push(parseFloat(longitud));
    const timestamp = row[3];
    _location.push(timestamp);
  });
  return _location;
}

async function updateMarker() {
  try {
    const _location = await getData();
    const coord = { lat: _location[0], lng: _location[1] };
    markers[0].setMap(null);
    marker = new google.maps.Marker({
      position: coord,
      map: map
    });
    markers[0] = marker;
    _changeText(_location);
  } catch (error) {
    console.log(error);
  }
  setTimeout(updateMarker, 1000);
}

function _changeText(_location) {
  document.getElementById("lat_text").innerHTML = _location[0];
  document.getElementById("long_text").innerHTML = _location[1];
  const date = _location[2].split(" ");
  document.getElementById("time_text").innerHTML = date[0] + " " + date[1];
  document.getElementById("date_text").innerHTML = date[2];
}
document.getElementById("CoordPanel").style.display = "none";
document.getElementById("hidec").style.display = "none";
document.getElementById("showc").addEventListener("click", function () {
  document.getElementById("CoordPanel").style.display = "block";
  document.getElementById("hidec").style.display = "block";
  document.getElementById("showc").style.display = "none";
})
document.getElementById("hidec").addEventListener("click", function () {
  document.getElementById("CoordPanel").style.display = "none";
  document.getElementById("hidec").style.display = "none";
  document.getElementById("showc").style.display = "block";
})