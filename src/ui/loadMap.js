// eslint-disable-next-line no-unused-vars
function CenterControl(controlDiv, map, parser) {
    this.show = true;

    const controlUI = document.createElement('button');
    controlUI.style.textAlign = 'center';
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.margin = '10px';
    controlUI.style.padding = '10px';
    controlUI.style.fontSize = '18px';
    controlUI.innerText = 'Show/Hide';
    controlDiv.appendChild(controlUI);

    controlUI.addEventListener('click', () => {
        if (this.show) {
            parser.hideDocument();
            this.show = false;
        } else {
            parser.showDocument();
            this.show = true;
        }
    });
}

// eslint-disable-next-line no-unused-vars
function loadMap() {
    const src = document.getElementById('map-canvas').getAttribute('data-what');

    window.map = new google.maps.Map(document.getElementById('map-canvas'), {
        zoom: 2,
        mapTypeId: 'terrain'
    });

    const centerControlDiv = document.createElement('div');
    // eslint-disable-next-line new-cap
    const parser = new geoXML3.parser({ map: window.map, processStyles: true });
    // eslint-disable-next-line no-unused-vars
    const centerControl = new CenterControl(centerControlDiv, window.map, parser);
    centerControlDiv.index = 1;
    window.map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);

    parser.parse(src);
}
