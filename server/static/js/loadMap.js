function initMap() {
    var src = document.getElementById('map-canvas').getAttribute('data-what');

    window.map = new google.maps.Map(document.getElementById('map-canvas'), {
        center: new google.maps.LatLng(-19.257753, 146.823688),
        zoom: 2,
        mapTypeId: 'terrain'
    });
    var parser = new geoXML3.parser({map: map, processStyles: true});
    parser.parse(src);
}
