import React, { useEffect, useState } from 'react'
import { useLocalStorage } from "../../elements/useLocalStorage.js"
import { useNavigate } from 'react-router-dom';
import getServerAPIURL from "../../elements/serverAPI.js"
import axios from 'axios';
import "leaflet-editable";
import Select from 'react-select';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./home.css";
import './Map.css';

import { Map, TileLayer, FeatureGroup, Polygon, Popup, LayerGroup, LayersControl } from "react-leaflet";
import { Sidebar, Tab } from 'react-leaflet-sidebarv2';
import { EditControl } from "react-leaflet-draw";
import { polygon } from 'leaflet';

function loadFilterDataFromServer(dataArray, setDataArrayFunc, apiPath) {
  if (dataArray.length === 0) {
    axios.get(getServerAPIURL() + apiPath).
      then((response) => {
        setDataArrayFunc(response.data.data);
      }).
      catch((error) => {
        alert("Ошибка сервера")
      })
  }
}

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
    const polygons = this.props.data;
    const editing = this.state.editing;
    const refs = this.polygonRefs = [];
    const _created = (e) => console.log(e);
    return (
      <div>
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


const Home = () => {
  const [listOfYears, setListOfYears] = useState([]);
  const [listOfCrops, setListOfCrops] = useState([]);

  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedCrops, setSelectedCrops] = useState([]);

  const [collapsedFlag, setCollapsedFlag] = useState(false);
  const [selectedTad, setSelectedTab] = useState('home')

  const [filtredData, setFiltredData] = useState([]);
  const [allLayersData, setAllLayersData] = useState({});

  const [userIsLoginedFlag, setUserIsLoginedFlag] = useLocalStorage("user_is_logined", false);
  const [loginedUserName, setLoginedUserName] = useLocalStorage("user_login", "");

  const navigate = useNavigate();

  function getSelectorListOfYears() {
    let selectorData = []
    listOfYears.map((item) => {
      selectorData.push(
        { label: item, value: item }
      )
    });
    return selectorData;
  }

  function updateSelectedYears(event) {
    let newSelectedYears = [];
    event.map((item) => newSelectedYears.push(item.label));
    setSelectedYears(newSelectedYears);
  }

  function getSelectorListOfCrops() {
    let selectorData = []
    listOfCrops.map((item) => {
      selectorData.push(
        { label: item.crop_name, value: item.crop_name }
      )
    });
    return selectorData;
  }

  function onClose() {
    setCollapsedFlag(true)
  }

  function onOpen(id) {
    setCollapsedFlag(false)
    setSelectedTab(id)
  }

  function updateSelectedCrops(event) {
    let newSelectedCrops = [];
    event.map((item) => newSelectedCrops.push(item.label));
    setSelectedCrops(newSelectedCrops);
  }

  function logout() {
    axios.post(getServerAPIURL() + "/api/auth/logout/")
    setUserIsLoginedFlag(false)
  }

  function loadYearData(year) {
    if (year != 2025) {
      let updatedYearData = allLayersData;
      axios.get(getServerAPIURL() + "/api/list-of-fields-main/?year=" + year)
        .then((response) => {
          let loadedServerData = response.data.features
          loadedServerData.map(
            (polygon) => {
              polygon.geometry.coordinates.forEach((sub_polygons) => {
                sub_polygons.forEach(
                  (polygon_coords_arr) => {
                    let reversedPoints = []
                    polygon_coords_arr.map(
                      (polygon_coords) => {
                        polygon_coords.reverse()
                        reversedPoints.push(polygon_coords)
                      }
                    )
                    polygon_coords_arr = reversedPoints;
                  }
                )
              }
              )
            }
          )
          updatedYearData[year] = loadedServerData;
        })
        .catch((error) => {
          alert("Превышено время ожидания сервера!")
        });
      setAllLayersData(updatedYearData);
      return updatedYearData[year]
    }
    return [];
  }

  function filterDataByCrops(data) {
    return selectedCrops.length !== 0 ? data.filter(layer => selectedCrops.includes((layer.properties.crop_info === null) ? layer.properties.crop_info : layer.properties.crop_info.crop_name)) : data
  }

  function getReversedGeometry(geometryData) {
    geometryData.forEach(
      (subPolygon) => {
        subPolygon.forEach(
          (pointCoord) => {
            pointCoord.reverse()
          }
        )
      }
    )
    return geometryData;
  }

  function filterData() {
    let newFiltredData = [];
    selectedYears.map(
      (selectedYear) => {
        let filtredYearData = filterDataByCrops(
          (allLayersData[selectedYear].length === 0) ?
            loadYearData(selectedYear) :
            allLayersData[selectedYear]
        )
        filtredYearData.map((polygon) => {
          polygon.properties["year_"] = selectedYear;
        })
        newFiltredData.push(...filtredYearData)
      }
    );
    setFiltredData(newFiltredData);
  }

  function exportShapeFile() {
    alert("a feature in the development process");
  }

  function importShapeFile() {
    alert("a feature in the development process");
  }

  function updataAllData() {
    let newAllLayersData = allLayersData;
    listOfYears.map(
      (year) => {
        if (!(year in allLayersData)) {
          newAllLayersData[year] = [];
        }
        else {
          loadYearData(year)
        }
      }
    );
    setAllLayersData(newAllLayersData);
  }

  function getDataToRender() {
    return filtredData;
  }

  useEffect(
    () => {
      if (!userIsLoginedFlag) {
        navigate('/login');
      }
    },
    [userIsLoginedFlag]
  )

  useEffect(
    () => {
      loadFilterDataFromServer(listOfYears, setListOfYears, "/api/get-allowed-years/");
      loadFilterDataFromServer(listOfCrops, setListOfCrops, "/api/list-of-crops/")
      updataAllData()
    }, [listOfYears, setListOfYears, listOfCrops, setListOfCrops]
  )

  return (
    <div>
      <Sidebar
        id="sidebar"
        collapsed={collapsedFlag}
        selected={selectedTad}
        onOpen={onOpen}
        onClose={onClose}
      >
        <Tab id="home" header="Home" icon="fa fa-home">
          <div className="sidebar__user-data">
            <div className="icon-profile">
              <svg width="70px" height="70px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
                <path opacity="0.4" d="M12.1207 12.78C12.0507 12.77 11.9607 12.77 11.8807 12.78C10.1207 12.72 8.7207 11.28 8.7207 9.50998C8.7207 7.69998 10.1807 6.22998 12.0007 6.22998C13.8107 6.22998 15.2807 7.69998 15.2807 9.50998C15.2707 11.28 13.8807 12.72 12.1207 12.78Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path opacity="0.34" d="M18.7398 19.3801C16.9598 21.0101 14.5998 22.0001 11.9998 22.0001C9.39977 22.0001 7.03977 21.0101 5.25977 19.3801C5.35977 18.4401 5.95977 17.5201 7.02977 16.8001C9.76977 14.9801 14.2498 14.9801 16.9698 16.8001C18.0398 17.5201 18.6398 18.4401 18.7398 19.3801Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="sidebar__user-data__status">
              <p style={{ fontWeight: "bold" }}>Пользователь: {loginedUserName}</p>
              <p style={{ ontSize: "12pt" }}>Статус: Админ</p>
            </div>
            <button href="#" className="sidebar__bnt-exit" onClick={logout}>
              <svg width="70px" height="70px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000" className="icon-svg">
                <g id="SVGRepo_bgCarrier" strokeWidth="0" />
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
                <g id="SVGRepo_iconCarrier"> <g clipPath="url(#clip0_429_11067)"> <path d="M15 4.00098H5V18.001C5 19.1055 5.89543 20.001 7 20.001H15" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /> <path d="M16 15.001L19 12.001M19 12.001L16 9.00098M19 12.001H9" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /> </g> <defs> <clipPath id="clip0_429_11067"> <rect width="24" height="24" fill="white" transform="translate(0 0.000976562)" /> </clipPath> </defs> </g>
              </svg>
            </button>
          </div>
          <div className="sidebar__filter-block">
            <p>Год:</p>
            <Select
              isMulti
              options={getSelectorListOfYears()}
              onChange={updateSelectedYears}
              autosize={false}
              style={{ width: '100%' }}
            />
          </div>
          <div className="sidebar__filter-block">
            <p>Культура:</p>
            <Select
              isMulti
              options={getSelectorListOfCrops()}
              onChange={updateSelectedCrops}
              autosize={false}
              style={{ width: '100%' }}
            />
          </div>
          <button className="classic-btn sidebar__btn-filter" onClick={filterData}>Показать</button>
          <button onClick={exportShapeFile}>export</button>
          <button onClick={importShapeFile}>import</button>
        </Tab>
        <Tab id="settings" header="Settings" icon="fa fa-cog" anchor="bottom">
          <p>Settings dialogue.</p>
        </Tab>
      </Sidebar>
      <EditMap className="sidebar-map" data={getDataToRender()} />
    </div>
  )
}

export default Home