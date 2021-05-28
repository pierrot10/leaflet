
function createHomepageOSMinit(_latitude,_longitude,_nbField){
	setMapHeight();   
    if( document.getElementById('map') != null ){


    	/* INITIATE LEAFLET */
    	var map = L.map('map', {
            center: [_latitude,_longitude],
            zoom: 18,
            scrollWheelZoom: false
        });

        L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                    //subdomains: '0123',
                    maxZoom: 20,
                    attribution: '<a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
        }).addTo(map);

        
        var markers = L.markerClusterGroup({
            showCoverageOnHover: false
        });

        /* REQUEST THE LOCATIONS */
        $.ajax({
            type: "POST",
            url: "sql/get_map.php",
            success: result,
            error: error,
            dataType: "json"
        });

        function error(data)
        {
            console.log("Error getting datas from DB");
            console.log(data);
        }

        function result(data){
            console.info("data:",data);

            var allMarkers=[];
            var nhtml = '<img src="assets/img/property-types/vineyard.png">';

            for (var i = 0; i < data.properties.length; i++) {

                allMarkers.push(L.latLng(data.properties[i]['la'], data.properties[i]['lo']));



		
		    /* SHOW IMAGE DEPENDING OF SENSOR VALUES */
                if((data.properties[i]['b1']>=data.properties[i]['se'] && data.properties[i]['b1'] < data.properties[i]['se']+1) ||
                    (data.properties[i]['b2']>=data.properties[i]['se'] && data.properties[i]['b2'] < data.properties[i]['se']+1) ||
                    (data.properties[i]['b3']>=data.properties[i]['se'] && data.properties[i]['b3'] < data.properties[i]['se']+1) ||
                    (data.properties[i]['b4']>=data.properties[i]['se'] && data.properties[i]['b4'] < data.properties[i]['se']+1)
                )
                {
                    nhtml = '<img src="assets/img/property-types/vineyard-orange.png">';
                }

               

                if(((data.properties[i]['b1'] < data.properties[i]['se']) && data.properties[i]['b1'] != null) ||
                    ((data.properties[i]['b2'] < data.properties[i]['se']) && data.properties[i]['b2'] != null) ||
                    ((data.properties[i]['b3'] < data.properties[i]['se']) && data.properties[i]['b3'] != null) ||
                    ((data.properties[i]['b4'] < data.properties[i]['se']) && data.properties[i]['b4'] != null)
                )
                {
                
                
                    nhtml = '<img src="assets/img/property-types/vineyard-red.png">';
                }
                else{
                    nhtml = '<img src="assets/img/property-types/vineyard.png">';
                }


                    
		/* POSITION OF THE ICONE */
                var _icon = L.divIcon({
                    //html: '<img src="' + locations[i][7] +'">',
                    html: nhtml,
                    iconSize:     [40, 48],
                    iconAnchor:   [20, 48],
                    popupAnchor:  [0, -48]
                });

                var title = data.properties[i]['station'];
                var marker = L.marker(new L.LatLng(data.properties[i]['la'],data.properties[i]['lo']), {
                    title: title,
                    icon: _icon
                });

		/* PREPARE THE MARKER */
                var str ='';
                if(data.properties[i]['b4'] != null)
                {
                    str = str.concat('<div class="tag price"> ' + data.properties[i]['b4'] + '°C</div>');
                }
                if(data.properties[i]['b3'] != null)
                {
                    str = str.concat('<div class="tag price"> ' + data.properties[i]['b3'] + '°C</div>');
                }
                if(data.properties[i]['b2'] != null)
                {
                    str = str.concat('<div class="tag price"> ' + data.properties[i]['b2'] + '°C</div>');
                }
                if(data.properties[i]['b1'] != null)
                {

                    str = str.concat('<div class="tag price"> ' + data.properties[i]['b1'] + '°C</div>');
                }

                
                marker.bindPopup(
                    '<div class="property">' +
                        '<a data-field=' + data.properties[i]['id_field'] +'" data-station=' + data.properties[i]['id_station'] +'" href="charts.php?field='+ data.properties[i]['id_field'] +'#st-'+ data.properties[i]['id_station'] +'">' +
                            '<div class="property-image">' +

                                '<img src="img/stations/station-' + data.properties[i]['id_station'] + '.jpg">' +
                            '</div>' +
                            '<div class="overlay">' +

                                '<div class="info">' +
                                      '<h3>' + data.properties[i]['station'] + '</h3>' +
                                    '<figure>' + data.properties[i]['da'] + '</figure>' +
                                     '<figure>' + data.properties[i]['la'] + ' ' + data.properties[i]['lo'] +'</figure>' +
                                    str +
                          
                                    //'<div class="tag"> ' + data.properties[i]['se'] + '°C</div>' +
                                    
                                  
                                '</div>' +
                            '</div>' +
                        '</a>' +
                    '</div>',{autoClose: true, closeOnClick: true, closeButton: true}

                );


                               
                var val = '';

                if(!isEmpty(data.properties[i]['b4']))
                {
                    val = data.properties[i]['b4'] +'°C ';
                }

                if(!isEmpty(data.properties[i]['b1']))
                {
                    val = val + data.properties[i]['b1'] +'°C ';
                }

                if(!isEmpty(data.properties[i]['su']))
                {
                    val = val + data.properties[i]['su'] +'W/m2 ';
                }

                if(!isEmpty(data.properties[i]['an']))
                {
                    val = val + data.properties[i]['an'] +'km/h ';
                }

                if(!isEmpty(data.properties[i]['sb']))
                {
                    val = val + data.properties[i]['sb'] +'°C (B)';
                }

                if(!isEmpty(data.properties[i]['sl']))
                {
                    val = val + data.properties[i]['sl'] +'°C (F)';
                }

                //val = val + '';

                marker.bindTooltip(val, {direction: 'bottom', permanent: true});

                markers.addLayer(marker);
            }

            if(_nbField>1){
                bounds = L.latLngBounds(allMarkers);
                map.fitBounds(bounds,{ padding: [10, 10] });
            }
        }

        


        map.addLayer(markers);


        map.on('locationfound', onLocationFound);

        function onLocationFound(){
            //alert("kk");
            $('#map').removeClass('fade-map');
        }

        $('body').addClass('loaded');

        setTimeout(function() {
            $('body').removeClass('has-fullscreen-map');
        }, 1000);

        $('#map').removeClass('fade-map');
    }
}
