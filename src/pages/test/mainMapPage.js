import React, { useEffect, useState, useRef } from 'react'
import { useLocalStorage } from "../../features/useLocalStorage.js"
import { useNavigate } from 'react-router-dom';
import getServerAPIURL from "../../features/serverAPI.js"
import axios from 'axios';
import "leaflet-editable";
import Select from 'react-select';
import { Sidebar, SidebarTab } from '../../elements/sidebar/sidebar.js';
import MainMap from '../../components/MainMap/MainMap.js';
import { extractShapes } from "../../features/utils.js";
import geomDecoding from '../../features/decodeServerGEOMData.js';
import UploadFiles from '../../elements/dropAndDrag/FileUpload.js';

import 'bootstrap/dist/css/bootstrap.min.css';
import "./test.css";
import './TestMap.css';


function loadFilterDataFromServer(dataArray, setDataArrayFunc, apiPath) {
  if (dataArray.length === 0) {
    axios.get(getServerAPIURL() + apiPath
      , {
        cors: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST",
          "Access-Control-Allow-Headers": "Authorization,X-My-Token"
        }
      }
    ).
      then((response) => {
        setDataArrayFunc(response.data.data);
      }).
      catch((error) => {
        console.log(error)
      })
  }
}

function reverseCoordsSystem(coordsList) {
  coordsList.coordinates.forEach(
    (subPolygonPoints) => {
      subPolygonPoints.forEach(
        (pointsArray) =>
          pointsArray.forEach(
            pointCoords => pointCoords.reverse()
          )
      )
    }
  )
  return coordsList
}

const MainMapPage = () => {
  const [showSatelliteImageFlag, setShowSatelliteImageFlag] = useState(false);
  const [showSatelliteImageIconsFlag, setShowSatelliteImagIconsFlag] = useState(false);

  const [layerIsEditingFlag, setLayerIsEditingFlag] = useState(false);

  const [editModFlag, setEditModFlag] = useState(false);
  const [showMapLegendFlag, setShowMapLegendFlag] = useState(true);

  const [listOfReg, setListOfReg] = useState([
    { label: "Хабаровский край", value: "khv" },
    { label: "ЕАО", value: "eao" },
    { label: "Приморье", value: "prm" },
    { label: "Амурская обл.", value: "amr" }
  ]);

  const mapZoomList = {
    "": {
      center: [
        52.40241887397332, 
        137.06079205949928
      ],
      zoom: 5,
      editable: true
    },
    "khv": {
      center: [
        48.48430069812584, 
        135.32423704901925
      ],
      zoom: 11,
      editable: true
    },
    "eao": {
      center: [
        48.68552087440201, 
        132.9713422863282
      ],
      zoom: 10,
      editable: true
    },
    "prm": {
      center: [
        44.429857265397246, 
        132.07821136505473
      ],
      zoom: 10,
      editable: true
    },
    "amr": {
      center: [
        50.18041592143885, 
        128.7900031681196
      ],
      zoom: 9,
      editable: true
    }
  }

  const [listOfYears, setListOfYears] = useState([]);
  const [listOfCrops, setListOfCrops] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState(undefined);

  const [lastSelectedRegion, setLastSelectedRegion] = useState('');

  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCrops, setSelectedCrops] = useState([]);

  const [collapsedFlag, setCollapsedFlag] = useState(false);
  const [selectedTad, setSelectedTab] = useState('home')

  const [allLayersData, setAllLayersData] = useState({});

  const [userIsLoginedFlag, setUserIsLoginedFlag] = useLocalStorage("user_is_logined", false);
  const [loginedUserName, setLoginedUserName] = useLocalStorage("user_login", "");

  const [mainMapData, setMainMapData] = useState([]);
  const [userMapData, setUserMapData] = useState([]);

  const [selectedFileToSave, setSelectedFileToSave] = useState("server");
  const [savedFileName, setSelectedFileName] = useState("");

  const [isLoading, setIsLoading] = useState(false);


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

  function updateSelectedYear(event) {
    setSelectedYear(event.label);
  }

  function updateSelectedRegion(event) {
    if (lastSelectedRegion != event.value) {
      setAllLayersData({})
      fetchDataSelectedYear(event.value)
    }
    setSelectedRegion(event.value);
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
    setSelectedCrops(event.map((selectedCropName) => listOfCrops.filter(item => item.crop_name == selectedCropName.label)));
  }

  function logout() {
    axios.post(getServerAPIURL() + "/auth/logout/"
      , {
        cors: {
          "Access-Control-Allow-Origin": "*"
        }
      }
    )
    setUserIsLoginedFlag(false)
  }

  function filterDataByCrops(data) {
    let cropIdList = []
    selectedCrops.map((crop)=>{cropIdList.push(crop[0].id)})
    return selectedCrops.length !== 0 ? data.filter(item => cropIdList.indexOf(item.id_crop_fact)!==-1) : data
  }

  function filterData() {
    try {
      if (allLayersData[selectedYear].length === 0) {
        alert("Данных за этот год для данного региона нет")
      }
      else {
        setMainMapData(
          filterDataByCrops(
            allLayersData[selectedYear]
          )
        )
      }
    }
    catch (err) {
      alert("Данные по данному региону загружаются.")
    }
  }

  const importShapeFile = async (e) => {
    setUserMapData(await extractShapes(e.target.files));
  };

  function exportShapeFile() {
    var shpwrite = require("@mapbox/shp-write");
    shpwrite.zip({
      type: "FeatureCollection",
      features: selectedFileToSave === "server" ? mainMapData : userMapData
    }, { outputType: "blob" }).then(function (zipBlob) {
      saveAs(zipBlob, savedFileName + ".zip");
    });
  }

  const fetchDataSelectedYear = async (region = selectedRegion) => {
    setIsLoading(true)
    try {
      const requests = listOfYears.map(year => axios.get(getServerAPIURL() + "/api/v2/get-fields-list/?year=" + year + "&region=" + region, { cors: { "Access-Control-Allow-Origin": "*" } }))
      const data = await axios.all(requests);
      let decodedFullData = {}
      data.forEach(
        (req, i) => {
          let decodedYearData = []
          req.data.data.map(
            (polygon) => {
              decodedYearData.push({
                "id": polygon.id,
                "id_crop_fact": polygon.id_crop_fact,
                "geom": reverseCoordsSystem(geomDecoding(polygon.geom))
              })
            }
          )
          decodedFullData[listOfYears[i]] = decodedYearData
        }
      )
      setAllLayersData(decodedFullData)
    }
    catch (err) {
      console.log(err)
    }
    finally {
      setIsLoading(false)
    }
  }

  function compliteShapeData() {
    let loadedServerData = userMapData
    loadedServerData.map(
      (polygon) => {
        polygon.geometry.coordinates.forEach((sub_polygons) => {
          sub_polygons.forEach(
            (polygon_coords_arr) => {
              polygon_coords_arr.reverse()
            }
          )
        }
        )
      }
    )
    return loadedServerData
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
      loadFilterDataFromServer(listOfCrops, setListOfCrops, "/api/list-of-crops/");
    }, [listOfYears, setListOfYears, listOfCrops, setListOfCrops]
  )


  function UpdateMapLegendFlag() {
    setShowMapLegendFlag(!showMapLegendFlag)
  }

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
                  <path fill="#000000" fillRule="evenodd" d="M14,9.00421 C14.5523,9.00421 15,9.45192 15,10.00418 L15,13.00418 C15,14.10878 14.1046,15.00418 13,15.00418 L3,15.00418 C1.89543,15.00418 1,14.10878 1,13.00418 L1,10.00418 C1,9.45192 1.44772,9.00421 2,9.00421 C2.55228,9.00421 3,9.45192 3,10.00418 L3,13.00418 L13,13.00418 L13,10.00418 C13,9.45192 13.4477,9.00421 14,9.00421 Z M8,1.59 L11.7071,5.2971 C12.0976,5.68763 12.0976,6.32079 11.7071,6.71132 C11.3166,7.10184 10.6834,7.10184 10.2929,6.71132 L9,5.41842 L9,10.00418 C9,10.55648 8.55228,11.00418 8,11.00418 C7.44772,11.00418 7,10.55648 7,10.00418 L7,5.41842 L5.70711,6.71132 C5.31658,7.10184 4.68342,7.10184 4.29289,6.71132 C3.90237,6.32079 3.90237,5.68763 4.29289,5.2971 L8,1.59 Z" />
                </svg>
              </div>
              <span>Export</span>
            </button>

            <button type="file" onClick={() => fileInputRef.current.click()} className="styled-btn btn-import">
              <div className="circle">
                <svg width="32px" height="32px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#000000" fillRule="evenodd" d="M14,9 C14.5523,9 15,9.44772 15,10 L15,13 C15,14.1046 14.1046,15 13,15 L3,15 C1.89543,15 1,14.1046 1,13 L1,10 C1,9.44772 1.44772,9 2,9 C2.55228,9 3,9.44771 3,10 L3,13 L13,13 L13,10 C13,9.44771 13.4477,9 14,9 Z M8,1 C8.55228,1 9,1.44772 9,2 L9,6.58579 L10.2929,5.29289 C10.6834,4.90237 11.3166,4.90237 11.7071,5.29289 C12.0976,5.68342 12.0976,6.31658 11.7071,6.70711 L8,10.4142 L4.29289,6.70711 C3.90237,6.31658 3.90237,5.68342 4.29289,5.29289 C4.68342,4.90237 5.31658,4.90237 5.70711,5.29289 L7,6.58579 L7,2 C7,1.44772 7.44772,1 8,1 Z" />
                </svg>
                <input onChange={importShapeFile} multiple={false} ref={fileInputRef} type='file' hidden />
              </div>
              <span>Import</span>
            </button>
          </div>
          <div className="sidebar__filters">
            <h5>Фильтрация</h5>
            <div className="sidebar__filter-block">
              <p>Регион:</p>
              <Select
                options={listOfReg}
                onChange={updateSelectedRegion}
                autosize={true}
                style={{ width: '100%' }}
              />
            </div>
            <p>{isLoading}</p>
            {
              selectedRegion === "" ? <p></p> :
                <div>
                  {
                    isLoading ? <p>Loading...</p> : <div>
                      <div className="sidebar__filter-block">
                        <p>Год:</p>
                        <Select
                          options={getSelectorListOfYears()}
                          onChange={updateSelectedYear}
                          autosize={true}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="sidebar__filter-block">
                        <p>Культура:</p>
                        <Select
                          isMulti
                          options={getSelectorListOfCrops()}
                          onChange={updateSelectedCrops}
                          autosize={true}
                          style={{ width: '100%' }}
                        />
                      </div>
                      {
                        selectedYear === "" ? <></> :
                          <button className="classic-btn sidebar__btn-filter" onClick={filterData}>
                            Показать
                          </button>
                      }

                    </div>
                  }
                </div>
            }
          </div>
          <UploadFiles selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles}/>
        </SidebarTab>
        <SidebarTab id="layers" header="Layers" icon="fa fa-file-image-o">
          <p><input type="checkbox" defaultChecked={editModFlag} name="myCheckbox" onClick={() => { setEditModFlag(!editModFlag); }} /> Режим редактирования</p>
          <p>выбор слоя <select onChange={e => setSelectedFileToSave(e.target.value)}>
            <option value="server">Сервер вц</option>
            <option value="user">Пользовательский</option>
          </select></p>
          <p>имя сохраняемого файла <input type='text' onChange={e => setSelectedFileName(e.target.value)}></input></p>
        </SidebarTab>
        <SidebarTab id="settings" header="Settings" icon="fa fa-cog" anchor="bottom">
          <p><input type="checkbox" defaultChecked={showSatelliteImageFlag} name="myCheckbox" onClick={() => { setShowSatelliteImageFlag(!showSatelliteImageFlag); }} /> Отобразить спутниковую подложку</p>
          <p><input type="checkbox" defaultChecked={showSatelliteImageIconsFlag} name="myCheckbox" onClick={() => { setShowSatelliteImagIconsFlag(!showSatelliteImageIconsFlag); }} /> Отобразить вспомогательные знаке на спутниковой подложке</p>
          {/* <p><button onClick={UpdateMapLegendFlag}>{showMapLegendFlag? "скрыть легенду карты" : "показать легенду карты"}</button></p> */}
        </SidebarTab>
      </Sidebar>
      <MainMap
        zoomConfig={mapZoomList[selectedRegion]}
        data={mainMapData}
        userMapData={compliteShapeData()}

        updateMapData={setMainMapData}
        updateUserMapData={setUserMapData}

        showSatelliteImage={showSatelliteImageFlag}
        showSatelliteImageIcons={showSatelliteImageIconsFlag}

        editingFlag={layerIsEditingFlag}
        updateEditingFlag={setLayerIsEditingFlag}

        editModFlag={editModFlag}

        cropList={listOfCrops}

        canShowLegend={showMapLegendFlag}

        selectedYear={selectedYear}
        selectedRegion={selectedRegion}

        selectedImageData={selectedFiles}
      />
    </div>
  )
}

export default MainMapPage

// /v2/get-fields-list/?year=2021&region=khv