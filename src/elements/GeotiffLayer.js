import React, { Component } from "react";
import { withLeaflet, MapLayer } from "react-leaflet";
import L from "leaflet";


import "leaflet-geotiff"
import "leaflet-geotiff/leaflet-geotiff-plotty"
import "leaflet-geotiff/leaflet-geotiff-vector-arrows"

class GeotiffLayer extends MapLayer {
  createLeafletElement(props) {
    const { url, options } = props;
    return L.leafletGeotiff(url, options);
  }

  componentDidMount() {
    const { map } = this.props.leaflet;
    this.leafletElement.addTo(map);
  }
}

export const PlottyGeotiffLayer = withLeaflet(props => {
  const { options, layerRef } = props;
  options.renderer = new L.LeafletGeotiff.Plotty(options);
  return <GeotiffLayer ref={layerRef} {...props} />;
});