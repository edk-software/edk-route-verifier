export default function() {
    const mapCanvasElement = $('div#map-canvas');

    this.routeUrl = mapCanvasElement.attr('data-what');
    this.language = $('html').attr('lang');
}
