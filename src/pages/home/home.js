import React, { useEffect, useState, useRef } from 'react'
import { useLocalStorage } from "../../elements/useLocalStorage.js"
import { useNavigate } from 'react-router-dom';
import getServerAPIURL from "../../elements/serverAPI.js"
import axios from 'axios';
import "leaflet-editable";
import Select from 'react-select';

import 'bootstrap/dist/css/bootstrap.min.css';
import "./home.css";
import './Map.css';

import { Sidebar, SidebarTab } from '../../elements/sidebar.js';
import AdminMap from '../../components/AdminMap/AdminMap.js';

import { extractShapes } from "../../elements/utils.js";

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

// function getCookie(name) {
//   var cookieValue = null;
//   if (document.cookie && document.cookie !== '') {
//     var cookies = document.cookie.split(';');
//     for (var i = 0; i < cookies.length; i++) {
//       var cookie = jQuery.trim(cookies[i]);
//       if (cookie.substring(0, name.length + 1) === (name + '=')) {
//         cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//         break;
//       }
//     }
//   }
//   return cookieValue;
// }


const Home = () => {
  const [shapeData, setShapeData] = useState([]);
  const [showShapeDataFlag, setShowShapeDataFlag] = useState(true)

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

  const fileInputRef = useRef();

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

  function makeLeafletCoords(data) {
    let complitedData = data
    complitedData.map(
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
    return complitedData
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

  const importShapeFile = async (e) => {
    setShapeData(await extractShapes(e.target.files));
  };

  function exportShapeFile() {
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
        <SidebarTab id="home" header="Home" icon="fa fa-home" className="sidebar__home">
          <div className="sidebar__user-data">
            <div className="sidebar__user-data__block">
              <div className="icon-profile">
                <svg width="56px" height="56px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
                  <path opacity="0.4" d="M12.1207 12.78C12.0507 12.77 11.9607 12.77 11.8807 12.78C10.1207 12.72 8.7207 11.28 8.7207 9.50998C8.7207 7.69998 10.1807 6.22998 12.0007 6.22998C13.8107 6.22998 15.2807 7.69998 15.2807 9.50998C15.2707 11.28 13.8807 12.72 12.1207 12.78Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path opacity="0.34" d="M18.7398 19.3801C16.9598 21.0101 14.5998 22.0001 11.9998 22.0001C9.39977 22.0001 7.03977 21.0101 5.25977 19.3801C5.35977 18.4401 5.95977 17.5201 7.02977 16.8001C9.76977 14.9801 14.2498 14.9801 16.9698 16.8001C18.0398 17.5201 18.6398 18.4401 18.7398 19.3801Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="sidebar__user-data__status">
                <p style={{ fontWeight: "bold" }}>Пользователь: {loginedUserName}</p>
                <p style={{ fontSize: "12pt" }}>Статус: Админ</p>
              </div>
            </div>
            <button href="#" className="sidebar__bnt-exit" onClick={logout} title="Выход">
              <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000" className="icon-svg">
                <g id="SVGRepo_bgCarrier" strokeWidth="0" />
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
                <g id="SVGRepo_iconCarrier"> <g clipPath="url(#clip0_429_11067)"> <path d="M15 4.00098H5V18.001C5 19.1055 5.89543 20.001 7 20.001H15" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /> <path d="M16 15.001L19 12.001M19 12.001L16 9.00098M19 12.001H9" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /> </g> <defs> <clipPath id="clip0_429_11067"> <rect width="24" height="24" fill="white" transform="translate(0 0.000976562)" /> </clipPath> </defs> </g>
              </svg>
            </button>
          </div>
          <hr></hr>
          <div className="sidebar__operations">
            <button onClick={exportShapeFile} className="styled-btn btn-export">
              <div className="circle">
                <svg width="32px" height="32px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#000000" fill-rule="evenodd" d="M14,9.00421 C14.5523,9.00421 15,9.45192 15,10.00418 L15,13.00418 C15,14.10878 14.1046,15.00418 13,15.00418 L3,15.00418 C1.89543,15.00418 1,14.10878 1,13.00418 L1,10.00418 C1,9.45192 1.44772,9.00421 2,9.00421 C2.55228,9.00421 3,9.45192 3,10.00418 L3,13.00418 L13,13.00418 L13,10.00418 C13,9.45192 13.4477,9.00421 14,9.00421 Z M8,1.59 L11.7071,5.2971 C12.0976,5.68763 12.0976,6.32079 11.7071,6.71132 C11.3166,7.10184 10.6834,7.10184 10.2929,6.71132 L9,5.41842 L9,10.00418 C9,10.55648 8.55228,11.00418 8,11.00418 C7.44772,11.00418 7,10.55648 7,10.00418 L7,5.41842 L5.70711,6.71132 C5.31658,7.10184 4.68342,7.10184 4.29289,6.71132 C3.90237,6.32079 3.90237,5.68763 4.29289,5.2971 L8,1.59 Z" />
                </svg>
              </div>
              <span>Export</span>
            </button>

            <button type="file" onClick={()=>fileInputRef.current.click()} className="styled-btn btn-import">
              <div className="circle">
                <svg width="32px" height="32px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#000000" fill-rule="evenodd" d="M14,9 C14.5523,9 15,9.44772 15,10 L15,13 C15,14.1046 14.1046,15 13,15 L3,15 C1.89543,15 1,14.1046 1,13 L1,10 C1,9.44772 1.44772,9 2,9 C2.55228,9 3,9.44771 3,10 L3,13 L13,13 L13,10 C13,9.44771 13.4477,9 14,9 Z M8,1 C8.55228,1 9,1.44772 9,2 L9,6.58579 L10.2929,5.29289 C10.6834,4.90237 11.3166,4.90237 11.7071,5.29289 C12.0976,5.68342 12.0976,6.31658 11.7071,6.70711 L8,10.4142 L4.29289,6.70711 C3.90237,6.31658 3.90237,5.68342 4.29289,5.29289 C4.68342,4.90237 5.31658,4.90237 5.70711,5.29289 L7,6.58579 L7,2 C7,1.44772 7.44772,1 8,1 Z" />
                </svg>
                <input onChange={importShapeFile} multiple={false} ref={fileInputRef} type='file'hidden/>
              </div>
              <span>Import</span>
            </button>
          </div>
          <div className="sidebar__filters">
            <h5>Фильтрация</h5>
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
            <button className="classic-btn sidebar__btn-filter" onClick={filterData}>
              Показать
            </button>
          </div>
        </SidebarTab>
        <SidebarTab id="settings" header="Settings" icon="fa fa-cog" anchor="bottom">
          <p><input type="checkbox" checked={showShapeDataFlag} name="myCheckbox" onClick={()=>{setShowShapeDataFlag(!showShapeDataFlag); console.log(showShapeDataFlag)}}/> Отобразить загруженный файл</p>
        </SidebarTab>
      </Sidebar>
      <AdminMap className="sidebar-map" data={getDataToRender()} shapeData={shapeData} showShapeDataFlag={showShapeDataFlag}/>
    </div>
  )
}

export default Home