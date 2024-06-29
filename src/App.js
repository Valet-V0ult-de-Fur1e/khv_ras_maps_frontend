import React, {useState, useEffect} from 'react';

import './App.css';

import axios from 'axios';


import { trackPromise, usePromiseTracker } from 'react-promise-tracker';

import Select from 'react-select';
import 'bootstrap/dist/css/bootstrap.min.css';

import L from 'leaflet';
import { Map, TileLayer, FeatureGroup, useLeaflet, Polygon, Marker, Popup, LayerGroup, LayersControl } from "react-leaflet";
import "leaflet-editable";
import Basemap from './Basemaps';
// import { EditControl } from "react-leaflet-draw";
import './Map.css';

import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { CSVExport } from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';
// import { polygon } from 'leaflet';

const { ExportCSVButton } = CSVExport;
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
      center: [ 48.5189, 135.2786 ],
      zoom: 13,
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

  onEditEnd = ( {layer} ) => {
    
    function updatePolygon(polygon, newCoords){
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

    return (
      <div>
          <button
            className={editing !== null ? 'active' : ''}
            onClick={this.onClick1}
          >сохранить</button>
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
          {polygons.map((n, i) =>
            <Polygon
              key={i}
              positions={n.geometry.coordinates[0]}
              ref={ref => refs[i] = ref}
              onEditabl_edisable={this.onEditEnd}
              index={i}
              color={ (n.properties.crop_info === null)? n.properties.crop_color : n.properties.crop_info.crop_color}
            >
            <Popup>
              <p>номер реестра: {n.properties.reestr_number}</p>
              <p>с\х культура: {(n.properties.crop_info === null)? n.properties.crop_color : n.properties.crop_info.crop_name}</p>
              <p>год: {n.properties.year_}</p>
              <p>площадь: {n.properties.area}</p>
              <button onClick={()=>{
                selectedPolygons.push(n);
              }}>
                сохранить
              </button>
              <button
                data-index={i}
                className={editing === i ? 'active' : ''}
                onClick={this.onClick}
              >редактировать</button>
            </Popup>
            </Polygon>
          )}
        </Map>
        {/* <pre>{JSON.stringify(polygons, null, 2)}</pre> */}
      </div>
    );
  }
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

    return (
      <div>
        <Map zoom={this.state.zoom} center={center}>
        <LayersControl>
            <LayersControl.BaseLayer name="Open Street Map">
              <TileLayer
                key={0}
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer checked name="Google Map">
              <TileLayer
                key={1}
                attribution="Google Maps"
                url="https://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Google Map Satellite">
              <LayerGroup>
                <TileLayer
                  key={2}
                  attribution="Google Maps Satellite"
                  url="https://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}"
                />
                {/* <TileLayer url="https://www.google.cn/maps/vt?lyrs=y@189&gl=cn&x={x}&y={y}&z={z}" /> */}
              </LayerGroup>
            </LayersControl.BaseLayer>
          </LayersControl>
          <FeatureGroup>
            {
              this.props.data.map((layer, index) => {
                  return (
                  <FeatureGroup>
                    <Polygon key={index} positions={layer.geometry.coordinates} color={(layer.properties.crop_info === null)?layer.properties.crop_info:layer.properties.crop_info.crop_color}>
                      <Popup>
                        <p>номер реестра: {layer.properties.reestr_number}</p>
                        <p>с\х культура: {(layer.properties.crop_info === null)?layer.properties.crop_info:layer.properties.crop_info.crop_name}</p>
                        <p>год: {layer.properties.year_}</p>
                        <p>площадь: {layer.properties.area}</p>
                        <button onClick={()=>{
                          selectedPolygons.push(layer);
                        }}>
                          сохранить
                        </button>
                      </Popup>
                    </Polygon>
                  </FeatureGroup>)
              })
            }
          </FeatureGroup>
        </Map>
      </div>
      
    );
  }
};

const area = 'GEOJSON';
const apiUrl = "http://195.133.198.89:8000/api/list-of-fields-main/";

let allYearsSelect = [];
let allCropsSelect = [];
let years = [];
let crops = [null];


function App() {
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
    for (var year in props){
      var layers_year = year.substring(year.length-4, year.length);
      if (!years.includes(layers_year)){
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
        } )
        layers.push(layer)
      }
    }
    
    setAllYearsQ(allYearsSelect);
    setAllLayers(layers);
    setSelectedYears(years);
    setSelectedCrops(crops);
  }

  function filterData() {
    setFiltredData((selectedYears.length != 0 && selectedCrops.length != 0) ? allLayers.filter(layer => selectedYears.includes(layer.properties.year_) && selectedCrops.includes((layer.properties.crop_info === null)? layer.properties.crop_info : layer.properties.crop_info.crop_name)) : [])
  };

  useEffect(() => {
    const years_list = ['2019', '2020', '2021', '2022', '2023', '2024']
    
    // let postjson = {'year': 2019, 'first': true, 'id': 1234123}
    years_list.forEach(year => {
      trackPromise(axios.get(apiUrl + "?year=" + year), area)
        .then(({ data }) => {
          all_years_data[year] = data;
          makeFiltersData(all_years_data)
        })
    });
    setMapsData(all_years_data)
    // trackPromise(axios.get(apiUrl + 
    //   "?year=2019"
    //   // "?year=2019&first=true"
    //   // , postjson,
    //   // {
    //   // headers: {
    //   //    'Content-Type': 'application/json'
    //   //   }
    //   // }
    //     ), area)
    //   .then(({ data }) => {
    //     setMapsData({"2019": data});
    //     makeFiltersData({"2019": data});})
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

  function selectOperationMod(){
    switch (operationCode) {
      case 0:
        return filtredData;
      case 1:
        return selectedPolygons;
      default:
        filtredData;
    }
  }

  function getTableData(){
    var tableData = []
    for (let ind = 0; ind < selectedPolygons.length; ind ++){
      tableData.push(
        {
          id: ind,
          reestr_number: selectedPolygons[ind].properties.reestr_number,
          year_: selectedPolygons[ind].properties.year_,
          crop_name: selectedPolygons[ind].properties.crop_name,
          area: selectedPolygons[ind].properties.area
        }
      )
    }
    return tableData
  }

  function Login () {
    setIsLogin(isLogin? false : true);
  }

  function makeSelectorData(props) {
    let selectorData = []
    props.map((item)=>{
      selectorData.push(
        { label: item, value: item }
      )
    })
    return selectorData
  }

  return (
    <div>
      {
        promiseInProgress ? 
        <div>Подождите, данные загружаются!</div> : <div>
          <nav className="navbar">
            <div className="container">
              <div className="logo">
              </div>
              <div className={`nav-elements  ${showNavbar && "active"}`}>
                <ul>
                  <button onClick={Login}> {isLogin ? "выключить режим редактирования" : "включить режим редактирования"}</button>
                </ul>
              </div>
            </div>
          </nav>
          {
            isLogin? <div> <h1 style={{ color: 'red' }}>Работает в тестовом режиме!</h1> <EditMap data={selectOperationMod()}/></div> : <div>
              <div className='filterDiv'>
                <h3>Год</h3>
                <Select 
                  isMulti 
                  options={makeSelectorData(years)} 
                  onChange={updateSelectedYears}
                />
                <h3>СХ культура</h3>
                <Select 
                  isMulti 
                  options={makeSelectorData(crops)} 
                  onChange={updateSelectedCrops}
                />
                <button onClick={filterData}>Обновить</button>
              </div>
              <MapComponent data={selectOperationMod()}/>
              <div>
              <button onClick={()=>{setOperationCode(1)}}>показать только сохранённые данные</button>
              <button onClick={()=>{setOperationCode(0)}}>показать все данные</button>
              <ToolkitProvider
                keyField="id"
                data={ getTableData() }
                columns={ [{
                  dataField: 'id',
                  text: 'индекс'
                }, {
                  dataField: 'reestr_number',
                  text: 'номер реестра'
                }, {
                  dataField: 'year_',
                  text: 'год'
                }, {
                  dataField: 'crop_name',
                  text: 'с/х культура'
                }, {
                  dataField: 'area',
                  text: 'Площадь'
                },
                {
                  dataField: "remove",
                  text: "Delete",
                  formatter: (cellContent, row) => {
                    return (
                      <button
                        className="btn btn-danger btn-xs"
                        onClick={() => {
                          selectedPolygons.pop(row.id)
                          filterData()
                        }}
                      >
                        Delete
                      </button>
                    );
                  }
                }
              ] 
              }
                exportCSV
              >
                {
                  props => (
                    <div>
                      <ExportCSVButton { ...props.csvProps }>Export CSV</ExportCSVButton>
                      <hr />
                      <BootstrapTable { ...props.baseProps } />
                    </div>
                  )
                }
              </ToolkitProvider>
            </div>
          </div>
          }
        </div>
      }
    </div>
  );
}

export default App;
