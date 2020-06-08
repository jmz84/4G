(function() {
 
    var zoomLevel = 10,
        mapCenter = [43.359745, 5.338480];
    
    var options = {
        center: mapCenter,
        zoom: zoomLevel
    };
    
    var map = L.map('map', options);
	

    
    L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: 'donn&eacute;es &copy; <a href="//osm.org/copyright">OpenStreetMap</a>/ODbL - rendu <a href="//openstreetmap.fr">OSM France</a>',
    minZoom: 1,
    maxZoom: 20
}).addTo(map);
 

// var command = L.control({position: 'topright'});
// command.onAdd = function (map) {
    // var div = L.DomUtil.create('div', 'command');
    // div.innerHTML += '<div style="text-align:center;"><span style="font-size:18px;">Points d\'intérêt</span><br /><span style="color:grey;font-size:14px;">(ville d\'Issy-Les-Moulineaux)</span></div>';
    //for (var i = 0; i < cats.length; i++) {
         // div.innerHTML += '<form><input id="test" type="checkbox"/>test</form>';
    //}
    // return div;
//};
//command.addTo(map);
 
	var geocoder = L.Control.geocoder({
	position:'topleft',
	placeholder:"Adresse client"
		
		
	})
.on('markgeocode', function(event) {
    var center = event.geocode.center;
	         var currentPos = [center.lat, center.lng];    
                queryFeatures(currentPos, 8);
})
.addTo(map);

    var stations,
        $body = $('body'),
        $locate = $('#locate'),
        $findNearest = $('#find-nearest'),
        $status = $('#status');
    
    $.getJSON('LTE1800.geojson', function(data) {
  
        $body.addClass('loaded');
        
        stations = L.geoJson(data, {
            
            // pointToLayer : function(feature, latlng) {
               // return L.circleMarker(latlng, {
                   // stroke : false,
                   // fillColor : 'red',
                   // fillOpacity : 0.6,
                   // radius: 10
               // });
            // }
        }); //.addTo(map); 
        

  $locate.fadeIn().on('click', function(e) {
                
                $status.html('finding your nearest locations')
         var currentPos = [e.latlng.lat, e.latlng.lng];           
                queryFeatures(currentPos, 3);

    });
	
 
    });
	
	
	
	

    function success(position) {
        
        $body.addClass('loaded');
        
        var currentPos = [position.coords.latitude,position.coords.longitude];
        
        map.setView(currentPos);

        var myLocation = L.marker(currentPos)
                            .addTo(map)
                            .bindTooltip("you are here")
                            .openTooltip();
        
            
        $findNearest.fadeIn()
            .on('click', function(e) {
                
                $findNearest.fadeOut();
                
                $status.html('finding your nearest locations')
            
                queryFeatures(currentPos, 5);
            
                myLocation.unbindTooltip();
            
                
        });

    };

    function error() {
        alert("Unable to retrieve your location");
    };
     
    function queryFeatures(currentPos, numResults) {
        
        var distances = [];
        
        stations.eachLayer(function(l) {
            
            var distance = L.latLng(currentPos).distanceTo(l.getLatLng())/1000;
            
            distances.push(distance);

        });
        
        distances.sort(function(a, b) {
            return a - b;
        });
        
        var stationsLayer = L.featureGroup();
            

        stations.eachLayer(function(l) {

			var infos = l.feature.properties;
            var distance = L.latLng(currentPos).distanceTo(l.getLatLng())/1000;
            
			  if(distance < distances[numResults]) {
   



L.marker(l.getLatLng())
                            .addTo(map)
                            .bindTooltip('Distance : '+distance.toLocaleString() + ' km')
                            .openTooltip();
							
			   

                 if(infos.emr_lb_systeme == "LTE 700") {
                L.circle(l.getLatLng(), {
                   stroke : false,
                   fillColor : 'green',
                   fillOpacity : 0.1,
                   radius: 5000
               }).addTo(map);		   
			   
			}

            if(infos.emr_lb_systeme == "LTE 1800") {
                L.circle(l.getLatLng(), {
                   stroke : false,
                   fillColor : 'blue',
                   fillOpacity : 0.1,
                   radius: 3000
               }).addTo(map);		   
			   
			}
			
			
            if(infos.emr_lb_systeme == "LTE 2600") {
                L.circle(l.getLatLng(), {
                   stroke : false,
                   fillColor : 'red',
                   fillOpacity : 0.1,
                   radius: 2000
               }).addTo(map);		   
	                l.bindTooltip('Distance : '+distance.toLocaleString() + ' km<br>Antenne : '+infos.sup_id+'<br>MAJ: '+infos.date_maj+'<br>Etat: '+infos.en_service+'<br>'); 
                l.openTooltip();		   
			}			
			   


                L.polyline([currentPos, l.getLatLng()], {
                    color : 'orange',
                    weight : 2,
                    opacity: 1,
                    dashArray : "5, 10"
                }).addTo(stationsLayer);
                
            }
        });
        
        map.flyToBounds(stationsLayer.getBounds(), {duration : 3, easeLinearity: .1 });
        
        map.on('zoomend', function() {
          
            map.addLayer(stationsLayer);
			
        })
      
    }

})();