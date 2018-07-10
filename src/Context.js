export default function () {
    const mapCanvasElement = $('div#map-canvas');

    this.routeUrl = mapCanvasElement.attr('data-what');
    this.routeParamsUrl = mapCanvasElement.attr('data-route-params');
    this.routeApproveUrl = mapCanvasElement.attr('data-route-approve');
}
