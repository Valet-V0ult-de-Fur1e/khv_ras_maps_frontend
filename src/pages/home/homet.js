import React, { useState, useEffect } from 'react';

import './home.css';

import axios from 'axios';

import { trackPromise, usePromiseTracker } from 'react-promise-tracker';

import Select from 'react-select';
import 'bootstrap/dist/css/bootstrap.min.css';

import L from 'leaflet';
import { Map, TileLayer, FeatureGroup, Polygon, Popup, LayerGroup, LayersControl } from "react-leaflet";
import "leaflet-editable";
import Basemap from './Basemaps';
import { EditControl } from "react-leaflet-draw";
import './Map.css';

import { Sidebar, Tab } from 'react-leaflet-sidebarv2';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});

let selectedPolygons = [];
let all_years_data = {}

class EditMap extends React.Component {
  state = {
    mapOptions: {
      center: [48.5189, 135.2786],
      zoom: 11,
      editable: true,
    },
    editing: null,
    polygons: this.props.data,
    basemap: 'osm'
  }
  onBMChange = (bm) => {
    this.setState({
      basemap: bm
    });
  }

  mapRef = React.createRef()
  polygonRefs = []

  onClick = e => {
    console.log(e)
    const index = +e.target.dataset.index;
    const refs = this.polygonRefs;

    this.setState(({ editing }) => {
      refs.forEach((n, i) => {
        const method = i === index && editing !== index
          ? 'enableEdit'
          : 'disableEdit';
        n.leafletElement[method]();
      });
      return {
        editing: editing === index ? null : index,
      };
    });
  }

  onClick1 = e => {
    const refs = this.polygonRefs;

    this.setState(({ editing }) => {
      refs.forEach((n, i) => {
        n.leafletElement['disableEdit']();
      });

      return {
        editing: null,
      };
    });
  }

  onLoad = e => {
    e.target.on('editable:disable', this.onEditEnd);
  }

  onEditEnd = ({ layer }) => {

    function updatePolygon(polygon, newCoords) {
      let newDataPolygon = polygon
      newDataPolygon.geometry.coordinates = [newCoords._latlngs]
      return newDataPolygon
    }

    this.setState(({ polygons }) => ({
      polygons: polygons.map((n, i) => i === layer.options.index ?
        updatePolygon(n, layer) : n
      ),
    }));
  }

  render() {
    const { polygons, editing } = this.state;
    const refs = this.polygonRefs = [];
    const _created = (e) => console.log(e);
    return (
      <div>
        {/* <button
          className={editing !== null ? 'active' : ''}
          onClick={this.onClick1}
        >сохранить</button> */}
        <Map
          {...this.state.mapOptions}
          ref={this.mapRef}
          whenReady={this.onLoad}
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
              onCreated={_created}
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
          {polygons.map((n, i) =>
            <Polygon
              key={i}
              positions={n.geometry.coordinates[0]}
              ref={ref => refs[i] = ref}
              onEditabl_edisable={this.onEditEnd}
              index={i}
              color={(n.properties.crop_info === null) ? n.properties.crop_color : n.properties.crop_info.crop_color}
            >
              <Popup>
                <p>номер реестра: {n.properties.reestr_number}</p>
                <p>с\х культура: {(n.properties.crop_info === null) ? n.properties.crop_color : n.properties.crop_info.crop_name}</p>
                <p>год: {n.properties.year_}</p>
                <p>площадь: {n.properties.area}</p>
                <button
                  data-index={i}
                  className={editing === i ? 'active' : ''}
                  onClick={this.onClick}
                >редактировать</button>
              </Popup>
            </Polygon>
          )}
        </Map>
      </div>
    );
  }
}


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

//     return (
//       <div>
//         <Map zoom={this.state.zoom} center={center}>
//           <LayersControl>
//             <LayersControl.BaseLayer name="Open Street Map">
//               <TileLayer
//                 key={0}
//                 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//               />
//             </LayersControl.BaseLayer>
//             <LayersControl.BaseLayer checked name="Google Map">
//               <TileLayer
//                 key={1}
//                 attribution="Google Maps"
//                 url="https://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}"
//               />
//             </LayersControl.BaseLayer>
//             <LayersControl.BaseLayer name="Google Map Satellite">
//               <LayerGroup>
//                 <TileLayer
//                   key={2}
//                   attribution="Google Maps Satellite"
//                   url="https://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}"
//                 />
//               </LayerGroup>
//             </LayersControl.BaseLayer>
//           </LayersControl>
//           <FeatureGroup>
//             {
//               this.props.data.map((layer, index) => {
//                 return (
//                   <FeatureGroup>
//                     <Polygon key={index} positions={layer.geometry.coordinates} color={(layer.properties.crop_info === null) ? layer.properties.crop_info : layer.properties.crop_info.crop_color}>
//                       <Popup>
//                         <p>номер реестра: {layer.properties.reestr_number}</p>
//                         <p>с\х культура: {(layer.properties.crop_info === null) ? layer.properties.crop_info : layer.properties.crop_info.crop_name}</p>
//                         <p>год: {layer.properties.year_}</p>
//                         <p>площадь: {layer.properties.area}</p>
//                       </Popup>
//                     </Polygon>
//                   </FeatureGroup>)
//               })
//             }
//           </FeatureGroup>
//         </Map>
//       </div>

//     );
//   }
// };

function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
          var cookie = jQuery.trim(cookies[i]);
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}

const area = 'GEOJSON';
const apiUrl = "https://195.133.198.89:8000/api/list-of-fields-main/";
let allYearsSelect = [];
let allCropsSelect = [];
let years = [];
let crops = [null];


function Home() {
  const { promiseInProgress } = usePromiseTracker({ area });
  const [mapsData, setMapsData] = useState();

  const [allLayers, setAllLayers] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedCrops, setSelectedCrops] = useState([]);

  const [allYearsQ, setAllYearsQ] = useState([]);

  const [filtredData, setFiltredData] = useState([]);

  const [operationCode, setOperationCode] = useState(0);
  const [showNavbar, setShowNavbar] = useState(false);

  const [isLogin, setIsLogin] = useState(false);


  function makeFiltersData(props) {
    let layers = [];
    for (var year in props) {
      var layers_year = year.substring(year.length - 4, year.length);
      if (!years.includes(layers_year)) {
        years.push(layers_year);
      }
      for (var layer_index in props[year].features) {
        let layer = props[year].features[layer_index];
        layer.properties['year_'] = layers_year;
        if (layer.properties.crop_info) {
          if (!crops.includes(layer.properties.crop_info.crop_name)) {
            crops.push(layer.properties.crop_info.crop_name)
          }
        }
        layer.geometry.coordinates.forEach((sub_polygons) => {
          sub_polygons.forEach(
            (polygon_coords_arr) => {
              polygon_coords_arr.map(
                (polygon_coords) => {
                  polygon_coords.reverse()
                }
              )
            }
          )
        })
        layers.push(layer)
      }
    }

    setAllYearsQ(allYearsSelect);
    setAllLayers(layers);
    setSelectedYears(years);
    setSelectedCrops(crops);
  }

  function filterData() {
    if (selectedYears.length != 0) {
      if (selectedCrops.length != 0) {
        setFiltredData(allLayers.filter(layer => selectedYears.includes(layer.properties.year_) && selectedCrops.includes((layer.properties.crop_info === null) ? layer.properties.crop_info : layer.properties.crop_info.crop_name)))
      }
      else {
        console.log(allLayers.filter(layer => selectedYears.includes(layer.properties.year_)))
        setFiltredData(allLayers.filter(layer => selectedYears.includes(layer.properties.year_)))
      }
    }
    else {
      setFiltredData([]);
    }
  };

  useEffect(() => {
    const years_list = ['2019', '2020', '2021', '2022', '2023', '2024']
    years_list.forEach(year => {
      trackPromise(axios.get(apiUrl + "?year=" + year), area)
        .then(({ data }) => {
          all_years_data[year] = data;
          makeFiltersData(all_years_data)
        })
    });
    setMapsData(all_years_data)
  }, [setMapsData]);

  function updateSelectedYears(event) {
    let newSelectedYears = [];
    event.map((item) => newSelectedYears.push(item.label));
    setSelectedYears(newSelectedYears);
  }

  function updateSelectedCrops(event) {
    let newSelectedCrops = [];
    event.map((item) => newSelectedCrops.push(item.label));
    setSelectedCrops(newSelectedCrops);
  }

  useEffect(() => {
    filterData()
    filterData()
    filterData()
  }, []);

  function selectOperationMod() {
    switch (operationCode) {
      case 0:
        return filtredData;
      case 1:
        return selectedPolygons;
      default:
        filtredData;
    }
  }

  function Login() {
    setIsLogin(isLogin ? false : true);
  }

  function makeSelectorData(props) {
    let selectorData = []
    props.map((item) => {
      selectorData.push(
        { label: item, value: item }
      )
    })
    return selectorData
  }

  const [collapsedFlag, setCollapsedFlag] = useState(false);
  const [selectedTad, setSelectedTab] = useState('home')

  function onClose() {
    setCollapsedFlag(true)
  }

  function onOpen(id) {
    setCollapsedFlag(false)
    setSelectedTab(id)
  }

  function exportData() {
    alert("a feature in the development process");
  }
  function importData() {
    alert("a feature in the development process");
  }

  return (
    <div>
      {
        promiseInProgress ?
          <div>Подождите, данные загружаются!</div> : <div>
            <div>
              <Sidebar
                id="sidebar"
                collapsed={collapsedFlag}
                selected={selectedTad}
                onOpen={onOpen}
                onClose={onClose}
              >
                <Tab id="home" header="Home" icon="fa fa-home">
                  <h3>Год</h3>
                  <Select
                    isMulti
                    options={makeSelectorData(years.sort())}
                    onChange={updateSelectedYears}
                  />
                  <h3>СХ культура</h3>
                  <Select
                    isMulti
                    options={makeSelectorData(crops)}
                    onChange={updateSelectedCrops}
                  />
                  <button onClick={filterData}>показать</button>
                  <button onClick={exportData}>export</button>
                  <button onClick={importData}>import</button>
                </Tab>
                <Tab id="settings" header="Settings" icon="fa fa-cog" anchor="bottom">
                  <p>Settings dialogue.</p>
                </Tab>
              </Sidebar>
              <EditMap className="sidebar-map" data={selectOperationMod()} />
              {/* {
                isLogin ?
                  <div> <h1 style={{ color: 'red' }}>Работает в тестовом режиме!</h1> <EditMap className="sidebar-map" data={selectOperationMod()} /></div> :
                  <MapComponent className="sidebar-map" data={selectOperationMod()} />
              } */}
            </div>
          </div>
      }
    </div>
  );
}

export default Home;