import React, { useState, useEffect } from "react";
import L from 'leaflet';
import { Map, TileLayer, FeatureGroup, useLeaflet, Polygon, Marker, Popup } from "react-leaflet";
import Basemap from './Basemaps';
import { EditControl } from "react-leaflet-draw";
import './Map.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});

function EditableLayer(props) {
  const leaflet = useLeaflet();
  const editLayerRef = React.useRef();
  let drawControlRef = React.useRef();
  let {map} = leaflet;

  useEffect(() => {
    
    if (!props.showDrawControl) {
      map.removeControl(drawControlRef.current);
    } else {
      map.addControl(drawControlRef.current);
    }

    editLayerRef.current.leafletElement.clearLayers();

    editLayerRef.current.leafletElement.addLayer(props.layer);
    props.layer.on("click", function (e) {
      props.onLayerClicked(e, drawControlRef.current);
    });
  }, [props, map]);

  function onMounted(ctl) {
    drawControlRef.current = ctl;
  }
  if (props.showDrawControl) console.log(props)

  return (
    <div>
      <FeatureGroup ref={editLayerRef}>
        <EditControl
          position="topright"
          onMounted={onMounted}
          onEditStop={(e)=>{console.log(e)}}
          {...props}
        />
        {
          props.layer.feature.geometry.coordinates.map((coords)=>{
            <Polygon positions={coords}>

            </Polygon>
          })
        }
        
      </FeatureGroup>
    </div>
  );
}

function EditableGroup(props) {
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(0);

  function handleLayerClick(e, drawControl) {
    setSelectedLayerIndex(e.target.feature.properties.editLayerId);
  }

  let dataLayer = new L.GeoJSON(props.data);
  let layers = [];
  let i = 0;
  dataLayer.eachLayer((layer) => {
    layer.feature.properties.editLayerId = i;
    layers.push(layer);
    i++;
  });

  return (
    <div>
      {layers.map((layer, i) => {
        if (layer.feature.geometry.type == "MultiPolygon") return (
          <EditableLayer
            key={i}
            layer={layer}
            showDrawControl={i === selectedLayerIndex}
            onLayerClicked={handleLayerClick}
          />
        );
      })}
    </div>
  );
}

class MapComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  state = {
    lat: 48.4189,
    lng: 135.2786,
    zoom: 10,
    basemap: 'osm'
  };

  onBMChange = (bm) => {
    this.setState({
      basemap: bm
    });
  }

  // onSelectedYearsChange = (sy) => {
  //   console.log(sy)
  // }

  render() {
    var center = [this.state.lat, this.state.lng];

    const basemapsDict = {
      osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      hot: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
      dark:"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
      cycle: "https://dev.{s}.tile.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
    }

    console.log(this.props)

    return (
      <div>
        <Map zoom={this.state.zoom} center={center}>
          <TileLayer
            url={basemapsDict[this.state.basemap]}
          />
          <Basemap basemap={this.state.basemap} onChange={this.onBMChange}/>
          <Marker position={center}>
            <Popup>Выбрана тема {this.state.basemap}</Popup>
          </Marker>
          <EditableGroup data={this.props.data} />
        </Map>
      </div>
      
    );
  }
};

export default MapComponent;