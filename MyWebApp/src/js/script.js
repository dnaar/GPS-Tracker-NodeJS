var map;
var markers = [];
var historicpath = [];
var filteredpath = [];
var filtermarkers = [, [],
    []
];
var pathmarkers = [, [],
    []
];
var historicmarker = [];
const today_date = new Date();
const today_boundaries = { start: new Date(today_date.getFullYear(), today_date.getMonth(), today_date.getDate()).getTime(), end: new Date(today_date.getFullYear(), today_date.getMonth(), today_date.getDate() + 1).getTime() };
const vehicle = { vehicle1: 1, vehicle2: 2 };
var selected = [, true, false];
var addline = [, false, false];
// Inicialización de mapa
async function iniciarMap() {
    map = L.map('map', { zoomControl: false }).setView([4.570868, -74.297333], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap Contributors </a><a target="_blank"></a>/ All Icons by <a target="_blank" href="https://icons8.com">Icons8</a>',
        maxZoom: 18,
        minZoom: 4
    }).addTo(map);
    const truck1icon = L.icon({
        iconUrl: 'src/icons/truck1.png',
        iconSize: [32, 32],
        shadowSize: [0, 0],
        iconAnchor: [18, 18],
    });
    const truck2icon = L.icon({
        iconUrl: 'src/icons/truck2.png',
        iconSize: [32, 32],
        shadowSize: [0, 0],
        iconAnchor: [18, 18],
    });
    var marker = L.marker([0, 0], { icon: truck1icon, interactive: false });
    markers[1] = marker;
    var marker2 = L.marker([0, 0], { icon: truck2icon, interactive: false });
    markers[2] = marker2;
    await _mostrarHistorial(vehicle.vehicle1);
    await updateMarker(vehicle.vehicle1);
    setInterval(() => {
        updateMarker(vehicle.vehicle1);
    }, 1000);
    setInterval(() => {
        updateMarker(vehicle.vehicle2);
    }, 1000);
}
// Función de obtención de datos
async function getData(vehicle) {
    const response = await fetch(`/loc/${vehicle}`, { method: 'GET' });
    const data = await response.json();
    return data;
}
// Actualizar marcador de localizacion
async function updateMarker(vehicle) {
    if (!selected[vehicle]) {
        return;
    }
    const _location = await getData(vehicle);
    const coord = { lat: _location.latitude, lng: _location.longitude };
    markers[vehicle].setLatLng(coord).addTo(map);
    _changeText(_location, vehicle);
    try {
        if (addline[vehicle] && !historicpath[vehicle].isEmpty()) {
            const path = historicpath[vehicle].getLatLngs();
            path.push(markers[vehicle].getLatLng());
            historicpath[vehicle].setLatLngs(path);
        }
    } catch (error) {
        return;
    }
}
// FF00E0   Color camion 2
// Función de actualización de datos
function _changeText(_location, vehicle) {
    datet = new Date(_location.timestamp)
    document.getElementById(`txtlat${vehicle}`).innerHTML = _location.latitude;
    document.getElementById(`txtlong${vehicle}`).innerHTML = _location.longitude;
    document.getElementById(`txtlumx${vehicle}`).innerHTML = _location.lumx;
    document.getElementById(`txtaccel${vehicle}`).innerHTML = _location.accel;
    if (datet.getMinutes() < 10) {
        document.getElementById(`time_text${vehicle}`).innerHTML = datet.getHours() + ":0" + datet.getMinutes();
    } else {
        document.getElementById(`time_text${vehicle}`).innerHTML = datet.getHours() + ":" + datet.getMinutes();
    }
    document.getElementById(`date_text${vehicle}`).innerHTML = datet.getDate() + "/" + (datet.getMonth() + 1) + "/" + datet.getFullYear();
}
// Función para centrar el mapa al marcador
function centerMap() {
    if (selected[1]) {
        map.setView(markers[vehicle.vehicle1].getLatLng(), 16);
    } else {
        map.setView(markers[vehicle.vehicle2].getLatLng(), 16);
    }

}
async function _mostrarHistorial(vehicle) {
    var historicline = [];
    addline[vehicle] = true;
    const options = {
        method: "POST",
        body: JSON.stringify(today_boundaries),
        headers: {
            "Content-Type": "application/json"
        }
    };
    const response = await fetch(`/historial/${vehicle}`, options);
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
        var lcolor;
        if (vehicle == 1) {
            lcolor = 'red';
        } else if (vehicle == 2) {
            lcolor = '#FF00E0';
        }
        historicmarker[vehicle] = L.marker(historicline[0], { icon: linestart }).bindPopup("<b>Inicio del recorrido del día.</b>").addTo(map);
        historicpath[vehicle] = L.polyline(historicline, {
            color: lcolor,
            opacity: 0.8,
            lineCap: linestart,
            interactive: false
        });
        historicpath[vehicle].addTo(map);
    }
}
// Filtrar el historial de datos
async function updateintervaldate(vehicle) {
    var polyline = [];
    var timespan = [];
    var sensordata = [];
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
    const response = await fetch(`/historial/${vehicle}`, options);
    const data = await response.json();
    data.forEach(object => {
        polyline.push({ lat: object.latitude, lng: object.longitude });
        timespan.push(object.timestamp);
        sensordata.push({ lumx: object.lumx, accel: object.accel });
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
        var lcolor;
        if (vehicle == 1) {
            lcolor = '#6200ff';
        } else if (vehicle == 2) {
            lcolor = '#34d2eb';
        }
        filtermarkers[vehicle][0] = L.marker(polyline[0], { icon: linestart }).bindPopup("<b>Inicio del recorrido.</b>").addTo(map);
        filtermarkers[vehicle][1] = L.marker(polyline[polyline.length - 1], { icon: lineend }).bindPopup("<b>Fin del recorrido.</b>").addTo(map);
        filteredpath[vehicle] = L.polyline(polyline, {
            color: lcolor,
            opacity: 0.8,
            interactive: false
        }).addTo(map);
        const submarker = L.marker([0, 0], { icon: path_icon });
        pathmarkers[vehicle][0] = submarker;
        mySlider = document.getElementById(`pathing${vehicle}`);
        mySlider.min = `${0}`;
        mySlider.max = `${polyline.length - 1}`;
        mySlider.oninput = function() {
            var index = parseInt(this.value);
            const sliderdate = new Date(timespan[index]);
            pathmarkers[vehicle][0].setLatLng(polyline[index]).addTo(map);
            date0 = document.getElementById(`sliderdate${vehicle}`);
            if (sliderdate.getMinutes() < 10) {
                date0.innerHTML = sliderdate.getDate() + "/" + (sliderdate.getMonth() + 1) + "/" + sliderdate.getFullYear() + " " + sliderdate.getHours() + ":0" + sliderdate.getMinutes();
            } else {
                date0.innerHTML = sliderdate.getDate() + "/" + (sliderdate.getMonth() + 1) + "/" + sliderdate.getFullYear() + " " + sliderdate.getHours() + ":" + sliderdate.getMinutes();
            }
            document.getElementById(`slideraccel${vehicle}`).innerHTML = sensordata[index].accel;
            document.getElementById(`sliderlumx${vehicle}`).innerHTML = sensordata[index].lumx;
        }
    } else {
        if (time_interval.start >= time_interval.end) {
            alert("Por favor ingrese un rango de fechas válido.");
            $(document.getElementById(`slidercontainer${vehicle}`)).slideUp(0);
        } else {
            alert("No hay recorrido entre esas fechas.");
            $(document.getElementById(`slidercontainer${vehicle}`)).slideUp(0);
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
        if (selected[1]) {
            updateintervaldate(vehicle.vehicle1);
            $(document.getElementById("slidercontainer1")).slideDown("fast");
        }
        if (selected[2]) {
            updateintervaldate(vehicle.vehicle2);
            $(document.getElementById("slidercontainer2")).slideDown("fast");
        }
    } else {
        $(document.getElementById("slidercontainer1")).slideUp("fast");
        $(document.getElementById("slidercontainer2")).slideUp("fast");
        if (selected[1]) {
            clearintervaldate(vehicle.vehicle1);
        }
        if (selected[2]) {
            clearintervaldate(vehicle.vehicle2);
        }
    }
});

function clearintervaldate(vehicle) {
    filteredpath[vehicle].remove();
    filtermarkers[vehicle][0].remove();
    filtermarkers[vehicle][1].remove();
    pathmarkers[vehicle][0].remove();
}
const checkHistorial1 = document.getElementById("historial1");
const checkHistorial2 = document.getElementById("historial2");
checkHistorial1.addEventListener('change', function() {
    if (this.checked) {
        if (selected[1]) {
            addline[1] = true;
            _mostrarHistorial(vehicle.vehicle1);
        }
    } else {
        if (selected[1]) {
            addline[1] = false;
            try {
                if (!historicpath[1].isEmpty()) {
                    historicpath[1].remove();
                    historicmarker[1].remove();
                }
            } catch (e) {}
        }
    }
});
checkHistorial2.addEventListener('change', function() {
    if (this.checked) {
        if (selected[2]) {
            addline[2] = true;
            _mostrarHistorial(vehicle.vehicle2);
        }
    } else {
        if (selected[2]) {
            try {
                if (!historicpath[2].isEmpty()) {
                    historicpath[2].remove();
                    historicmarker[2].remove();
                }
            } catch (e) {}
        }
    }
});
async function v1selected() {
    selected[1] = !selected[1];
    addline[1] = !addline[1];
    document.getElementById("ubicacion2").style.borderTop = "";
    $(document.getElementById("options")).slideToggle("fast");
    if (selected[1]) {
        $(document.getElementById("ubicacion_padding")).fadeIn("fast");
        $(document.getElementById("filter_padding")).fadeIn("fast");
        $(document.getElementById("ubicacion1")).slideDown("fast");
        updateMarker(vehicle.vehicle1);
        if (selected[2]) {
            document.getElementById("selectHeader").innerHTML = "Camión 1 y Camión 2";
            document.getElementById("ubicacion2").style.borderTop = "5px solid #feffff";
        } else {
            document.getElementById("selectHeader").innerHTML = "Camión 1";
        }
        if (checkHistorial1.checked) {
            _mostrarHistorial(vehicle.vehicle1);
        }
        if (checkFiltrado.checked) {
            updateintervaldate(vehicle.vehicle1);
            $(document.getElementById("slidercontainer1")).slideDown("fast");
        }
        document.getElementById("checked1").style.display = "inline";
    } else {
        document.getElementById("checked1").style.display = "none";
        $(document.getElementById("ubicacion1")).slideUp("fast");
        markers[1].remove();
        if (selected[2]) {
            document.getElementById("selectHeader").innerHTML = "Camión 2";
        } else {
            document.getElementById("selectHeader").innerHTML = "Elige un camión";
            $(document.getElementById("ubicacion_padding")).fadeOut("fast");
            $(document.getElementById("filter_padding")).fadeOut("fast");
        }
        if (checkFiltrado.checked) {
            clearintervaldate(vehicle.vehicle1);
            $(document.getElementById("slidercontainer1")).slideUp("fast");
        }
        if (checkHistorial1.checked) {
            try {
                if (!historicpath[1].isEmpty()) {
                    historicpath[1].remove();
                    historicmarker[1].remove();
                }
            } catch (e) {}
        }
    }
}
async function v2selected() {
    selected[2] = !selected[2];
    addline[2] = !addline[2];
    document.getElementById("ubicacion2").style.borderTop = "";
    $(document.getElementById("options")).slideToggle("fast");
    if (selected[2]) {
        $(document.getElementById("ubicacion_padding")).fadeIn("fast");
        $(document.getElementById("filter_padding")).fadeIn("fast");
        $(document.getElementById("ubicacion2")).slideDown("fast");
        updateMarker(vehicle.vehicle2);
        if (selected[1]) {
            document.getElementById("selectHeader").innerHTML = "Camión 1 y Camión 2";
            document.getElementById("ubicacion2").style.borderTop = "5px solid #feffff";
        } else {
            document.getElementById("selectHeader").innerHTML = "Camión 2";
        }
        if (checkHistorial2.checked) {
            _mostrarHistorial(vehicle.vehicle2);
        }
        if (checkFiltrado.checked) {
            updateintervaldate(vehicle.vehicle2);
            $(document.getElementById("slidercontainer2")).slideDown("fast");
        }
        document.getElementById("checked2").style.display = "inline";
    } else {
        document.getElementById("checked2").style.display = "none";
        $(document.getElementById("ubicacion2")).slideUp("fast");
        markers[2].remove();
        if (selected[1]) {
            document.getElementById("selectHeader").innerHTML = "Camión 1";
        } else {
            document.getElementById("selectHeader").innerHTML = "Elige un camión";
            $(document.getElementById("ubicacion_padding")).fadeOut("fast");
            $(document.getElementById("filter_padding")).fadeOut("fast");
        }
        if (checkFiltrado.checked) {
            clearintervaldate(vehicle.vehicle2);
            $(document.getElementById("slidercontainer2")).slideUp("fast");
        }
        if (checkHistorial2.checked) {
            try {
                if (!historicpath[2].isEmpty()) {
                    historicpath[2].remove();
                    historicmarker[2].remove();
                }
            } catch (e) {}
        }
    }
}

function showoptions() {
    $(document.getElementById("options")).slideToggle("fast");
}