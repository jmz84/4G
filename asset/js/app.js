(function () {
	var sliderrange = 0.2;
	var poiLayers = [];
	var radiusLTE700 = [];
	var radiusLTE1800 = [];
	var radiusLTE2600 = [];
	var currentPos = [];
	var test = [];
	var antennesLayer = [];
	var zoomLevel = 10,

	/*Configuration de l'affichage de la carte d'arrivée*/
	mapCenter = [43.359745, 5.338480];
	var options = {
		center: mapCenter,
		zoom: zoomLevel
	};
	var map = L.map('map', options);

	/*Paramètrage des icones antenne*/
	var LeafIcon = L.icon({
		iconUrl: 'asset/img/marker-icon-red.png',
		iconAnchor: [15, 30],
	});


	/*Ajout du slider de rapport*/
	var sidebar = L.control.sidebar('sidebar', {
		closeButton: true,
		position: 'left'
	});
	map.addControl(sidebar);

	/*Affichage de la map*/
	L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
		attribution: 'donn&eacute;es &copy; <a href="//osm.org/copyright">OpenStreetMap</a>/ODbL - rendu <a href="//openstreetmap.fr">OSM France</a>',
		minZoom: 1,
		maxZoom: 20
	}).addTo(map);

	/*Ajout du bouton de rapport*/

	var actiongeoloc = L.control({position: 'topleft'});
	actiongeoloc.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'actiongeoloc');
		div.innerHTML = '<form><input class="geoloc "id="geoloc" type="button"/></form>';
		return div;
	};

	actiongeoloc.addTo(map);
	geoloc.addEventListener('click', gogeoloc);

	function gogeoloc() {
	if (!navigator.geolocation){
                alert("<p>ésolé, votre navigateur ne supporte pas la géolocalisation</p>");
                return;
            }

            navigator.geolocation.getCurrentPosition(success);
	}
	
function success(position) {
      
        currentPos = [position.coords.latitude,position.coords.longitude];
        
        map.setView(currentPos, 10);

        var myLocation = L.marker(currentPos)
                            .addTo(map)
                            .bindTooltip("Vous êtes ici")
                            .openTooltip();
	 queryFeatures(currentPos, 0.2);		

}	

    function error() {
        alert("Impossible de récupérer votre position");
    };						

	/*Ajout du bouton de rapport*/

	var actionreport = L.control({position: 'topleft'});
	actionreport.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'actionreport');
		div.innerHTML = '<form><input class="report "id="report" type="button"/></form>';
		return div;
	};

	actionreport.addTo(map);
	report.addEventListener('click', showreport);

	function showreport() {
		sidebar.show();

	}

	/*Ajout du bloc checkbox*/

	var checktag = L.control({position: 'topright'});

	checktag.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'checktag');
		div.innerHTML = "<h4>Filtre</h4>";
		div.innerHTML += '<form><input id="LTE700" type="checkbox"/>LTE700</form>';
		div.innerHTML += '<form><input id="LTE1800" type="checkbox"/>LTE1800</form>';
		div.innerHTML += '<form><input id="LTE2600" type="checkbox"/>LTE2600</form>';
		return div;
	};

	checktag.addTo(map);
	LTE700.addEventListener('change', update);
	LTE1800.addEventListener('change', update);
	LTE2600.addEventListener('change', update);

	function update() {
		radiusLTE700.clearLayers();
		radiusLTE1800.clearLayers();
		radiusLTE2600.clearLayers();
		queryFeatures(currentPos, sliderrange);
	}



	/*Ajout du bloc légende*/
	var legende = L.control({
		position: "bottomright"
	});

	legende.onAdd = function (map) {
		var div = L.DomUtil.create("div", "legende");
		div.innerHTML += "<h4>Légende</h4>";
		div.innerHTML += '<i style="background: rgba(0, 255, 0, 0.2) "></i><span>LTE 700 - 10Km</span><br>';
		div.innerHTML += '<i style="background: rgba(0, 0, 255, 0.2)"></i><span>LTE 1800 - 6Km</span><br>';
		div.innerHTML += '<i style="background: rgba(255, 0, 0, 0.2)"></i><span>LTE 2600 - 4Km</span><br>';
		div.innerHTML += '<br>Base mise à jour le 13/06/2020';
		return div;
	};
	legende.addTo(map);

	/*Ajout du selecteur de distance*/
	var slider = L.control.range({
		position: 'topleft',
		min: 0.2,
		max: 10,
		value: 0.2,
		step: 0.2,
		orient: 'vertical',
		icon: false,
		id: slider,
	});

	/*Nettoyage de la carte lors du changement de distance*/
	slider.on('input change', function (e) {
		console.log(currentPos);
		map.removeLayer(antennesLayer);
		poiLayers.clearLayers();
		radiusLTE700.clearLayers();
		radiusLTE1800.clearLayers();
		radiusLTE2600.clearLayers();
		sliderrange = e.value;
		queryFeatures(currentPos, sliderrange);
	});
	map.addControl(slider);

	/*Ajout d'une échelle*/
	L.control.scale().addTo(map);

	/*Ajout de bloc de recherche d'adresse avec nettoyage de la carte lors d'une recherche*/
	var geocoder = L.Control.geocoder({
		position: 'topleft',
		placeholder: "Adresse client"
	}).on('markgeocode', function (event) {
		var center = event.geocode.center;
		currentPos = [center.lat, center.lng];
		map.removeLayer(antennesLayer);
		map.removeLayer(poiLayers);
		map.removeLayer(radiusLTE700);
		map.removeLayer(radiusLTE1800);
		map.removeLayer(radiusLTE2600);
		queryFeatures(currentPos, 0.2);

	}).addTo(map);


	var antennes,
	$body = $('body');

	/*Recherche du fichier geoJson contenant les données des antennes*/
	$.getJSON('datas/base.geojson', function (data) {

		$body.addClass('loaded');

		antennes = L.geoJson(data, {

		});

	});

	function queryFeatures(currentPos, numResults) {
		var distances = [];
		var infos = [];
		antennes.eachLayer(function (l) {

			var distance = L.latLng(currentPos).distanceTo(l.getLatLng()) / 1000;

			distances.push(distance);

		});

		distances.sort(function (a, b) {
			return a - b;
		});

		antennesLayer = L.featureGroup();
		poiLayers = L.featureGroup();
		radiusLTE700 = L.featureGroup();
		radiusLTE1800 = L.featureGroup();
		radiusLTE2600 = L.featureGroup();

		antennes.eachLayer(function (l) {

			var valuepoint = l.feature.properties;

			var distance = L.latLng(currentPos).distanceTo(l.getLatLng()) / 1000;

			if (distance < numResults) {

				infos.push(valuepoint);

				valuepoint["test"] = distance.toLocaleString();

				/*Construction du rapport qui sera envoyé dans le slider de gauche*/
				var antenne = "<h1>Rayon d\'analyse " + numResults + " Km</h1>";
				antenne += "<table id='report' width=100%>";
				antenne += "<thead>";
				antenne += "<tr>";
				antenne += "<th>ID Support</th>";
				antenne += "<th>Système </th>";
				antenne += "<th>Distance</th>";
				antenne += "<th>MAJ</th>";
				antenne += "<th>Mise en service</th>";
				antenne += "<th>Etat</th>";
				antenne += "</tr>";
				antenne += "</thead>";
				antenne += "<tbody>";

				$.each(infos, function (key, item) {
					antenne += "<tr>";
					antenne += "<td>" + item.sup_id + "</td>";
					antenne += "<td>" + item.emr_lb_systeme + "</td>";
					antenne += "<td>" + item.test + " km</td>";
					antenne += "<td>" + item.date_maj + "</td>";
					antenne += "<td>" + item.emr_dt_service + "</td>";
					antenne += "<td>" + item.en_service + "</td>";
					antenne += "</tr>";
				});
				antenne += "</tbody>";
				antenne += "</table>";


				/*On envoie les infos dans le slider*/
				$('#sidebar_content').html(antenne);

				/*On affiche les l'icone des d'antennes*/

				poi = L.marker(l.getLatLng(), {
					icon: LeafIcon
				}).bindTooltip('ID Support :' + valuepoint.sup_id + '</br>Distance : ' + distance.toLocaleString() + ' km');
				poiLayers.addLayer(poi);
				poiLayers.addTo(map);

				/*On affiche le 1er type d'antenne*/
				if ($('#LTE700').is(':checked')) {
					if (valuepoint.emr_lb_systeme == "LTE 700") {
						LTE700 = L.circle(l.getLatLng(), {
							stroke: false,
							fillColor: 'green',
							fillOpacity: 0.1,
							radius: 5000
						});
						radiusLTE700.addLayer(LTE700);
						radiusLTE700.addTo(map);
					}
				};

				/*On affiche le 2nde type d'antenne*/
				if ($('#LTE1800').is(':checked')) {
					if (valuepoint.emr_lb_systeme == "LTE 1800") {
						LTE1800 = L.circle(l.getLatLng(), {
							stroke: false,
							fillColor: 'blue',
							fillOpacity: 0.1,
							radius: 3000
						}).addTo(map);
						radiusLTE1800.addLayer(LTE1800);
						radiusLTE1800.addTo(map);
					}
				};

				/*On affiche le 3ème type d'antenne*/
				if ($('#LTE2600').is(':checked')) {
					if (valuepoint.emr_lb_systeme == "LTE 2600") {
						LTE2600 = L.circle(l.getLatLng(), {
							stroke: false,
							fillColor: 'red',
							fillOpacity: 0.1,
							radius: 2000
						}).addTo(map);
						radiusLTE2600.addLayer(LTE2600);
						radiusLTE2600.addTo(map);
					}
				};

			}
		});


	}



})();
