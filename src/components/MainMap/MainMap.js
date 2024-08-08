import React, { useEffect, useState } from "react"
import { Map, TileLayer, FeatureGroup, Polygon, Popup, LayerGroup, LayersControl, ImageOverlay } from "react-leaflet";
import "leaflet-editable";
import { EditControl } from "react-leaflet-draw";



const MainMap = (props) => {
  const mapOptions = {
    center: [48.5189, 135.2786],
    zoom: 11,
    editable: true
  };

  const [editingFlag, setEditingFlag] = useState(null);
  const [basemap, setBasemap] = useState('osm');

  const mapRef = React.createRef();

  const onLoad = e => {
    e.target.on('editable:disable', onEditEnd);
  }

  const newPolygonCreated = (e) => {
    console.log(e);
  }

  const onEditEnd = ({ layer }) => {

    // function updatePolygon(polygon, newCoords) {
    //   console.log(polygon)
    //   let newDataPolygon = polygon
    //   newDataPolygon.geometry.coordinates = [newCoords._latlngs]
    //   return newDataPolygon
    // }
    // if (this.selectedDowndate === -1) {
    //   console.log(123)
    //   this.setState(({ polygons }) => ({
    //     polygons: polygons.map((n, i) => i === layer.options.index ?
    //       updatePolygon(n, layer) : n
    //     ),
    //   }));
    // }
    // else {
    //   this.selectedDowndate = -1;
    //   this.setState(({ polygons }) => ({
    //     polygons: polygons.map((n, i) => n
    //     ),
    //   }));
    // }
  }


  useEffect(
    () => {
      props.updatMapData([1])
    }, []
  )

  return (
    <div>
      <Map
        {...mapOptions}
        ref={mapRef}
        whenReady={onLoad}
      >
        <LayersControl>
          <LayersControl.BaseLayer name="Open Street Map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer checked name="Google Map">
            <TileLayer
              attribution="Google Maps"
              url="https://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Google Map Satellite">
            <LayerGroup>
              <TileLayer
                attribution="Google Maps Satellite"
                url="https://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}"
              />
              <TileLayer url="https://www.google.cn/maps/vt?lyrs=y@189&gl=cn&x={x}&y={y}&z={z}" />
            </LayerGroup>
          </LayersControl.BaseLayer>
        </LayersControl>
        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={newPolygonCreated}
            draw={
              {
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
              }
            }
          />
        </FeatureGroup>
        {props.data.map((n, i) => 
        //  <FeatureGroup>
        //   {n.geometry.coordinates.map(
        //     (coords, j) => <Polygon
        //     key={i}
        //     positions={coords}
        //     // ref={ref => refs[i] = ref}
        //     onEditabl_edisable={onEditEnd}
        //     index={i}
        //     color={(n.properties.crop_info === null) ? n.properties.crop_color : n.properties.crop_info.crop_color}
        //   />
        //   )}
        //  </FeatureGroup>
        <Polygon
            key={i}
            positions={n.geometry.coordinates}
            // ref={ref => refs[i] = ref}
            onEditabl_edisable={onEditEnd}
            index={i}
            color={(n.properties.crop_info === null) ? n.properties.crop_color : n.properties.crop_info.crop_color}
          />
        )}
      </Map>
    </div>
  )
}

export default MainMap;