import React, {useState, useEffect} from 'react';

import './App.css';

import axios from 'axios';
import { trackPromise, usePromiseTracker } from 'react-promise-tracker';

import Select from 'react-select';
import 'bootstrap/dist/css/bootstrap.min.css';

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

const basemapsDict = [
  { label: 'osm', value: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" },
  { label: 'hot', value: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" },
  { label: 'dark', value: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png" },
  { label: 'cycle', value: "https://dev.{s}.tile.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png" }
]


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
  if (props.showDrawControl) {console.log(props); console.log(1)}

  return (
    <div>
      <FeatureGroup>
        {
          props.layer.feature.geometry.coordinates.map((coords)=>{
            // {console.log(props.layer.feature.properties.crop_color)}
            <Polygon 
              onclick={(e)=>{console.log(e)}}
              positions={coords}
              pathOptions={{
                 'color': props.layer.feature.properties.crop_color 
                }}
            >
              <Popup>Выбрана тем</Popup>
            </Polygon>
          })
        }
      </FeatureGroup>
      <FeatureGroup ref={editLayerRef}>
        <EditControl
          position="topright"
          onMounted={onMounted}
          onEditStop={(e)=>{console.log(e)}}
          {...props}
        />
        {
          props.layer.feature.geometry.coordinates.map((coords)=>{
            // {console.log(props.layer.feature.properties.crop_color)}
            <Polygon 
              positions={coords}
              pathOptions={{
                 'color': props.layer.feature.properties.crop_color 
                }}
            >
              <Popup>Выбрана тем</Popup>
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

  render() {
    var center = [this.state.lat, this.state.lng];

    const basemapsDict =
      {
      osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      hot: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
      dark:"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
      cycle: "https://dev.{s}.tile.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
    }

    console.log(this.props)

    return (
      <div>
        <Map zoom={this.state.zoom} center={center}>
          <TileLayer url={basemapsDict[this.state.basemap]}/>
          <Basemap basemap={this.state.basemap} onChange={this.onBMChange}/>
          <Marker position={center} onclick={(e)=>{console.log(e)}}>
            <Popup>Выбрана тема {this.state.basemap}</Popup>
          </Marker>
          <EditableGroup data={this.props.data} />
        </Map>
      </div>
      
    );
  }
};

const area = 'GEOJSON';
const apiUrl = "http://127.0.0.1:8000/markers/getData";

let allYearsSelect = [];
let allCropsSelect = [];

function App() {
  const { promiseInProgress } = usePromiseTracker({ area });
  const [mapsData, setMapsData] = useState();

  const [allLayers, setAllLayers] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedCrops, setSelectedCrops] = useState([]);

  const [allYearsQ, setAllYearsQ] = useState([]);

  const [filtredData, setFiltredData] = useState([]);

  const [selectedBase, serSelectedBase] = useState("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");

  function makeFiltersData(props) {
    let layers = [];
    let years = [];
    let crops = [];
    for (var year in props){
      var layers_year = year.substring(year.length-4, year.length);
      years.push(layers_year);
      for (var layer_index in props[year].features) {
        let layer = props[year].features[layer_index];
        layer.properties['year_'] = layers_year;
        if (!crops.includes(layer.properties.crop_name)) {
          crops.push(layer.properties.crop_name)
        }
        layer.geometry.coordinates.forEach( (sub_polygons) => {
          sub_polygons.forEach(
            (polygon_coords_arr) => {
              polygon_coords_arr.reverse()
            }
          )
        } )
        layers.push(layer)
      }
    }
    years.map((year)=>{
      allYearsSelect.push(
        { label: year, value: year }
      )
    })

    crops.map((crop)=>{
      allCropsSelect.push(
        { label: crop, value: crop }
      )
    })

    setAllYearsQ(allYearsSelect);
    setAllLayers(layers);
    setSelectedYears(years);
    setSelectedCrops(crops);
  }

  function filterData() {
    setFiltredData((selectedYears.length != 0 && selectedCrops.length != 0) ? allLayers.filter(layer => selectedYears.includes(layer.properties.year_) && selectedCrops.includes(layer.properties.crop_name)) : [])
    console.log(filtredData)
  };

  useEffect(() => {
    trackPromise(axios.get(apiUrl), area).then(({ data }) => {
      setMapsData(data);
      makeFiltersData(data);
    });
  }, [setMapsData]);

  function updateSelectedYears(event) {
    let newSelectedYears = [];
    event.map((item)=>newSelectedYears.push(item.label));
    setSelectedYears(newSelectedYears);
  }

  function updateSelectedCrops(event) {
    let newSelectedCrops = [];
    event.map((item)=>newSelectedCrops.push(item.label));
    setSelectedCrops(newSelectedCrops);
  }

  useEffect(() => {
    filterData()
    filterData()
    filterData()
  }, []);

  return (
    <div>
      {
        promiseInProgress ? 
        <div>Подождите, данные загружаются!</div> : <div>
            <div className='filterDiv'>
              <h3>Год</h3>
              <Select 
                isMulti 
                options={allYearsQ} 
                onChange={updateSelectedYears}
              />
              <h3>СХ культура</h3>
              <Select 
                isMulti 
                options={allCropsSelect} 
                onChange={updateSelectedCrops}
              />
              <button onClick={filterData}>Обновить</button>
            </div>
            <MapComponent data={filtredData} geojsonData={allLayers}/>
          </div>
      }
    </div>
  );
}

export default App;






// class MapComponent extends React.Component {
//   constructor(props) {
//     super(props);
//   }

//   state = {
//     lat: 48.4189,
//     lng: 135.2786,
//     zoom: 10,
//     basemap: 'osm'
//   };

//   onBMChange = (bm) => {
//     this.setState({
//       basemap: bm
//     });
//   }

//   render() {
//     var center = [this.state.lat, this.state.lng];

//     const basemapsDict =
//       {
//       osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
//       hot: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
//       dark:"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
//       cycle: "https://dev.{s}.tile.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
//     }

//     return (
//       <div>
//         <Map zoom={this.state.zoom} center={center}>
//           <TileLayer url={basemapsDict[this.state.basemap]}/>
//           <Basemap basemap={this.state.basemap} onChange={this.onBMChange}/>
//           <FeatureGroup>
//             {
//               this.props.data.map((layer) => {
//                   return (
//                   <FeatureGroup>
//                     <Polygon positions={layer.geometry.coordinates}>

//                     </Polygon>
//                   </FeatureGroup>)
//               })
//             }
//           </FeatureGroup>
//           <Marker position={center} onclick={(e)=>{console.log(e)}}>
//             <Popup>Выбрана тема {this.state.basemap}</Popup>
//           </Marker>
//         </Map>
//       </div>
      
//     );
//   }
// };
