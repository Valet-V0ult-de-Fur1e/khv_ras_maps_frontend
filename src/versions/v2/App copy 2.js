import React, {useState, useEffect} from 'react';

import './App.css';

import axios from 'axios';
import { trackPromise, usePromiseTracker } from 'react-promise-tracker';

import Select from 'react-select';
import 'bootstrap/dist/css/bootstrap.min.css';

import L from 'leaflet';
import { Map, TileLayer, FeatureGroup, useLeaflet, Polygon, Marker, Popup } from "react-leaflet";
import Basemap from './Basemaps';
import './Map.css';

import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { CSVExport } from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';

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

    return (
      <div>
        <Map zoom={this.state.zoom} center={center}>
          <TileLayer
            url={basemapsDict[this.state.basemap]}
          />
          <Basemap basemap={this.state.basemap} onChange={this.onBMChange}/>
          <FeatureGroup>
            {
              this.props.data.map((layer) => {
                  return (
                  <FeatureGroup>
                    <Polygon positions={layer.geometry.coordinates} color={layer.properties.crop_color}>
                      <Popup>
                        <p>номер реестра: {layer.properties.reestr_number}</p>
                        <p>с\х культура: {layer.properties.crop_name}</p>
                        <p>год: {layer.properties.year_}</p>
                        <p>площадь: {layer.properties.area}</p>
                        <button onClick={()=>{
                          selectedPolygons.push(layer);
                        }}>
                          добавить
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

  const [operationCode, setOperationCode] = useState(0);

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
  );
}

export default App;
