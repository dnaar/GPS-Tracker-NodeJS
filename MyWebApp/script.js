var map;
var markers = [];
var historicpath;
var addline = false;
const map_bounds = {north: 85, south: -85,west:-179.9999,east:180};

// Inicialización de mapa
async function iniciarMap() {
  const initcoord = { lat: 4.570868, lng: -74.297333 };
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 6,
    center: initcoord,
    minZoom: 2,
    restriction: {latLngBounds: map_bounds}
  });
  marker = new google.maps.Marker({
    map: map
  });
  markers[0] = marker;
  marker2 = new google.maps.Marker({
    map: map
  });
  markers[1] = marker2;
  await updateMarker();
}
// Función de obtención de datos
async function getData() {
  // Obtener datos del listener remoto
  const response = await fetch('/loc', {method: 'GET'});
  const data = await response.json();
  return data;
}

// Actualizar marcador de localizacion
async function updateMarker() {
  try {
    const _location = await getData();
    const coord = { lat: _location.latitude, lng: _location.longitude };
    markers[0].setPosition(coord);
    if(addline){
      const path = historicpath.getPath();
      path.push(markers[0].getPosition());
    }
    _changeText(_location);
  } catch (error) {
    console.log(error);
  }
  setTimeout(updateMarker, 1000);
}
// Función de actualización de datos
function _changeText(_location) {
  document.getElementById("lat_text").innerHTML = _location.latitude;
  document.getElementById("long_text").innerHTML = _location.longitude;
  const date = _location.timestamp.split(" ");
  document.getElementById("time_text").innerHTML = date[0] + " " + date[1];
  document.getElementById("date_text").innerHTML = date[2];
}
// Función para centrar el mapa al marcador
function centerMap(){
  map.setCenter(markers[0].getPosition());
  map.setZoom(18);
}

async function _mostrarHistorial(){
  var polyline = [];
  addline = true;
  const response = await fetch('/historial', {method: 'GET'});
  const data = await response.json();
  data.forEach(object=>{
    polyline.push({lat: object.latitude, lng: object.longitude});
  })
  historicpath = new google.maps.Polyline({
    path: polyline,
    geodesic: true,
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 2
  });
  historicpath.setMap(map);
  document.getElementById("mostrarHistorial").style.display = "none";
  document.getElementById("limpiarHistorial").style.display = "block";
}

function _limpiarHistorial(){
  document.getElementById("limpiarHistorial").style.display = "none";
  document.getElementById("mostrarHistorial").style.display = "block";
  historicpath.setMap(null);
  addline = false;
}

// Pasos extra para el panel de datos
document.getElementById("CoordPanel").style.display = "none";
document.getElementById("hidec").style.display = "none";
document.getElementById("limpiarHistorial").style.display = "none";
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