var map;
var markers = [];

// Inicialización de mapa
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

// Función de obtención de sdatos
async function getData() {
  const _location = [];
  // Obtener datos del listener remoto
  const response = await fetch('/loc', {method: 'GET'});
  const data = await response.json();
  row = data.split(',');
  _location.push(parseFloat(row[0]));
  _location.push(parseFloat(row[1]));
  _location.push(row[2]);
  return _location;
}

// Actualizar marcador de localizacion
async function updateMarker() {
  try {
    const _location = await getData();
    const coord = { lat: _location[0], lng: _location[1] };
    markers[0].setPosition(coord);
    _changeText(_location);
  } catch (error) {
    console.log(error);
  }
  setTimeout(updateMarker, 1000);
}

// Función de actualización de datos
function _changeText(_location) {
  document.getElementById("lat_text").innerHTML = _location[0];
  document.getElementById("long_text").innerHTML = _location[1];
  const date = _location[2].split(" ");
  document.getElementById("time_text").innerHTML = date[0] + " " + date[1];
  document.getElementById("date_text").innerHTML = date[2];
}

// Pasos extra para el panel de datos
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