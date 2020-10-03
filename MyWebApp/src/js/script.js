var map;
var markers = [];
var historicpath;
var historicline;
var filteredpath;
var filtermarkers = [];
var pathmarkers = [];
var historicmarker;
var addline = false;
const today_date = new Date();
const today_boundaries = { start: new Date(today_date.getFullYear(), today_date.getMonth(), today_date.getDate()).getTime(), end: new Date(today_date.getFullYear(), today_date.getMonth(), today_date.getDate() + 1).getTime() };

// Inicialización de mapa
async function iniciarMap() {
    map = L.map('map', { zoomControl: false }).setView([4.570868, -74.297333], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap Contributors </a><a target="_blank"></a>/ All Icons by <a target="_blank" href="https://icons8.com">Icons8</a>',
        maxZoom: 18,
        minZoom: 4
    }).addTo(map);
    const truck1icon = L.icon({
        iconUrl: 'src/icons/first_truck.png',
        iconSize: [32, 32],
        shadowSize: [0, 0],
        iconAnchor: [18, 18],
    });
    var marker = L.marker([0, 0], { icon: truck1icon });
    markers[0] = marker;
    var marker2 = L.marker([0, 0]);
    markers[1] = marker2;
    await updateMarker();
    await _mostrarHistorial();
}

// Función de obtención de datos
async function getData() {
    // Obtener datos del listener remoto
    const response = await fetch('/loc', { method: 'GET' });
    const data = await response.json();
    return data;
}

// Actualizar marcador de localizacion
async function updateMarker() {
    try {
        const _location = await getData();
        const coord = { lat: _location.latitude, lng: _location.longitude };
        markers[0].setLatLng(coord).addTo(map);
        if (addline && historicline.length > 0) {
            const path = historicpath.getLatLngs();
            path.push(markers[0].getLatLng());
            historicpath.setLatLngs(path);
        }
        _changeText(_location);
    } catch (error) {
        console.log(error);
    }
    setTimeout(updateMarker, 5000);
}

// Función de actualización de datos
function _changeText(_location) {
    datet = new Date(_location.timestamp)
    if (datet.getMinutes() < 10) {
        document.getElementById("time_text").innerHTML = datet.getHours() + ":0" + datet.getMinutes();
    } else {
        document.getElementById("time_text").innerHTML = datet.getHours() + ":" + datet.getMinutes();
    }
    document.getElementById("date_text").innerHTML = datet.getDate() + "/" + (datet.getMonth() + 1) + "/" + datet.getFullYear();
}
// Función para centrar el mapa al marcador
function centerMap() {
    map.setView(markers[0].getLatLng(), 16);
}

async function _mostrarHistorial() {
    historicline = [];
    addline = true;
    const options = {
        method: "POST",
        body: JSON.stringify(today_boundaries),
        headers: {
            "Content-Type": "application/json"
        }
    };
    const response = await fetch('/historial', options);
    const data = await response.json();
    data.forEach(object => {
        historicline.push({ lat: object.latitude, lng: object.longitude });
    });
    const linestart = L.icon({
        iconUrl: 'src/icons/start_flag.png',
        iconSize: [32, 32],
        shadowSize: [0, 0],
        iconAnchor: [8, 30],
    });
    if (historicline.length > 0) {
        historicmarker = L.marker(historicline[0], { icon: linestart }).bindPopup("<b>Inicio del recorrido del día.</b>").addTo(map);
        historicpath = L.polyline(historicline, {
            color: 'red',
            lineCap: linestart
        });
        historicpath.addTo(map);
    }

}

// Filtrar el historial de datos
async function updateintervaldate() {
    var polyline = [];
    var timespan = [];
    var date = document.getElementById("datetime").value.split(" ");
    date = { day: date[0], time: date[1] };
    day = date.day.split("/");
    time = date.time.split(":");
    const init_date = new Date(parseFloat(day[0]), parseFloat(day[1]) - 1, parseFloat(day[2]), parseFloat(time[0]), parseFloat(time[1])).getTime();
    var date = document.getElementById("datetime2").value.split(" ");
    date = { day: date[0], time: date[1] };
    day = date.day.split("/");
    time = date.time.split(":");
    const final_date = new Date(parseFloat(day[0]), parseFloat(day[1]) - 1, parseFloat(day[2]), parseFloat(time[0]), parseFloat(time[1])).getTime();
    const time_interval = { start: init_date, end: final_date };
    const options = {
        method: "POST",
        body: JSON.stringify(time_interval),
        headers: {
            "Content-Type": "application/json"
        }
    };
    const response = await fetch('/historial', options);
    const data = await response.json();
    data.forEach(object => {
        polyline.push({ lat: object.latitude, lng: object.longitude });
        timespan.push(object.timestamp);
    });
    if (polyline.length > 0) {
        const linestart = L.icon({
            iconUrl: 'src/icons/start_flag.png',
            iconSize: [32, 32],
            shadowSize: [0, 0],
            iconAnchor: [8, 30],
        });
        const lineend = L.icon({
            iconUrl: 'src/icons/finish_flag.png',
            iconSize: [32, 32],
            shadowSize: [0, 0],
            iconAnchor: [0, 30],
        });
        const path_icon = L.icon({
            iconUrl: 'src/icons/path_truck.png',
            iconSize: [24, 24],
            shadowSize: [0, 0],
            iconAnchor: [12, 12],
        });
        filtermarkers[0] = L.marker(polyline[0], { icon: linestart }).bindPopup("<b>Inicio del recorrido.</b>").addTo(map);
        filtermarkers[1] = L.marker(polyline[polyline.length - 1], { icon: lineend }).bindPopup("<b>Fin del recorrido.</b>").addTo(map);
        filteredpath = L.polyline(polyline, {
            color: '#6200ff'
        }).addTo(map);

        const submarker = L.marker([0, 0], { icon: path_icon });
        pathmarkers[0] = submarker;
        mySlider = document.getElementById("pathing");
        mySlider.min = `${0}`;
        mySlider.max = `${polyline.length - 1}`;
        mySlider.oninput = function() {
            var index = parseInt(this.value);
            const sliderdate = new Date(timespan[index]);
            pathmarkers[0].setLatLng(polyline[index]).addTo(map);
            date0 = document.getElementById("slidervalue0");
            if (sliderdate.getMinutes() < 10) {
                date0.innerHTML = sliderdate.getDate() + "/" + (sliderdate.getMonth() + 1) + "/" + sliderdate.getFullYear() + " " + sliderdate.getHours() + ":0" + sliderdate.getMinutes();
            } else {
                date0.innerHTML = sliderdate.getDate() + "/" + (sliderdate.getMonth() + 1) + "/" + sliderdate.getFullYear() + " " + sliderdate.getHours() + ":" + sliderdate.getMinutes();
            }
        }

        document.getElementById("pathing").style.display = "block";
        document.getElementById("slidervalue0").style.display = "block";
    } else {
        if (time_interval.start >= time_interval.end) {
            alert("Por favor ingrese un rango de fechas válido.");
        } else {
            alert("No hay recorrido entre esas fechas.");
        }
        document.getElementById("filtrado").checked = false;

    }
}
var init_check = false;
var end_check = false;
const checkFiltrado = document.getElementById("filtrado");


document.getElementById("datetime").onblur = function() {
    if (!(this.value == "")) {
        init_check = true;
        checkingbox();
    }
};
document.getElementById("datetime2").onblur = function() {
    if (!(this.value == "")) {
        end_check = true;
        checkingbox();
    }
};

function checkingbox() {
    if (end_check & init_check) {
        checkFiltrado.disabled = false;
    }
}
checkFiltrado.addEventListener('change', function() {
    if (this.checked) {
        updateintervaldate();
    } else {
        clearintervaldate();
    }
});

function clearintervaldate() {
    document.getElementById("pathing").style.display = "none";
    document.getElementById("slidervalue0").style.display = "none";
    filteredpath.remove();
    filtermarkers[0].remove();
    filtermarkers[1].remove();
    pathmarkers[0].remove();
}

const checkHistorial = document.getElementById("historial");
checkHistorial.addEventListener('change', function() {
    if (this.checked) {
        _mostrarHistorial();
    } else {
        if (historicline.length > 0) {
            historicpath.remove();
            historicmarker.remove();
        }
        addline = false;
    }
});

// Pasos extra para el panel de datos
document.getElementById("pathing").style.display = "none";
document.getElementById("slidervalue0").style.display = "none";