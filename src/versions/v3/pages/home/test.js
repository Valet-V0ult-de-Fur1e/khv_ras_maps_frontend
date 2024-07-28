import React, { useEffect, useState } from 'react'
import { useLocalStorage } from "../../elements/useLocalStorage.js"
import { useNavigate } from 'react-router-dom';
import getServerAPIURL from "../../elements/serverAPI.js"
import axios from 'axios';
import "leaflet-editable";
import Select from 'react-select';
import AdminMap from '../../components/AdminMap/AdminMap.js';
import "./home.css";


const Home = () => {
  const [listOfYears, setListOfYears] = useState([]);
  const [listOfCrops, setListOfCrops] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedCrops, setSelectedCrops] = useState([]);

  const [filtredData, setFiltredData] = useState({});
  const [allLayersData, setAllLayersData] = useState({});

  const [authKey, setAuthKey] = useLocalStorage("auth_key", "");
  const [userIsLoginedFlag, setUserIsLoginedFlag] = useLocalStorage("user_is_logined", false);
  const [loginedUserName, setLoginedUserName] = useLocalStorage("user_login", "");

  const navigate = useNavigate();

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
    let updatedYearData = allLayersData;
    const headers = {
      'Content-Type': 'application/json',
      "X-CSRFToken": authKey,
    };
    axios.get(getServerAPIURL() + "/api/list-of-fields-main/?year=" + year, {headers})
      .then((response) => {
        updatedYearData[year] = response.data.data;
      })
      .catch((error) => {
        alert("Превышено время ожидания сервера!")
      });
    setAllLayersData(updatedYearData);
    return updatedYearData[year]
  }

  function filterDataByCrops(data) {
    return (selectedCrops.length === 0) ? data.filter(layer => selectedCrops.includes((layer.properties.crop_info === null) ? layer.properties.crop_info : layer.properties.crop_info.crop_name)) : data
  }

  function filterData() {
    let newFiltredData = {};
    selectedYears.map(
      (selectedYear) => {
        newFiltredData[selectedYear] = filterDataByCrops(
          (allLayersData[selectedYear].length === 0) ?
            loadYearData(selectedYear) :
            allLayersData[selectedYear]
        )
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

  function showSettingsWindow() {
    alert("a feature in the development process");
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
      let newAllLayersData = allLayersData;
      listOfYears.map(
        (year) => {
          if (!(year in allLayersData)) {
            newAllLayersData[year] = [];
          }
        }
      );
      setAllLayersData(newAllLayersData);
    }, [listOfYears, setListOfYears, listOfCrops, setListOfCrops, allLayersData, setAllLayersData]
  )

  return (
    <div>
      <AdminMap data={filtredData}/>
      <nav className='sidebar'>
        <div className="sidebar__main-info">
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
          </div>
          <button href="#" className="sidebar__bnt-exit" onClick={logout}>
            <svg width="70px" height="70px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000" className="icon-svg">
              <g id="SVGRepo_bgCarrier" strokeWidth="0" />
              <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
              <g id="SVGRepo_iconCarrier"> <g clipPath="url(#clip0_429_11067)"> <path d="M15 4.00098H5V18.001C5 19.1055 5.89543 20.001 7 20.001H15" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /> <path d="M16 15.001L19 12.001M19 12.001L16 9.00098M19 12.001H9" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /> </g> <defs> <clipPath id="clip0_429_11067"> <rect width="24" height="24" fill="white" transform="translate(0 0.000976562)" /> </clipPath> </defs> </g>
            </svg>
          </button>
        </div>
        <div className="sidebar__operations">
          <button className="styled-btn btn-settings" onClick={showSettingsWindow}>
            <div className="circle settings-circle">
              <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g id="SVGRepo_bgCarrier" strokeWidth="0" />
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
                <g id="SVGRepo_iconCarrier"> <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> <path d="M12.9046 3.06005C12.6988 3 12.4659 3 12 3C11.5341 3 11.3012 3 11.0954 3.06005C10.7942 3.14794 10.5281 3.32808 10.3346 3.57511C10.2024 3.74388 10.1159 3.96016 9.94291 4.39272C9.69419 5.01452 9.00393 5.33471 8.36857 5.123L7.79779 4.93281C7.3929 4.79785 7.19045 4.73036 6.99196 4.7188C6.70039 4.70181 6.4102 4.77032 6.15701 4.9159C5.98465 5.01501 5.83376 5.16591 5.53197 5.4677C5.21122 5.78845 5.05084 5.94882 4.94896 6.13189C4.79927 6.40084 4.73595 6.70934 4.76759 7.01551C4.78912 7.2239 4.87335 7.43449 5.04182 7.85566C5.30565 8.51523 5.05184 9.26878 4.44272 9.63433L4.16521 9.80087C3.74031 10.0558 3.52786 10.1833 3.37354 10.3588C3.23698 10.5141 3.13401 10.696 3.07109 10.893C3 11.1156 3 11.3658 3 11.8663C3 12.4589 3 12.7551 3.09462 13.0088C3.17823 13.2329 3.31422 13.4337 3.49124 13.5946C3.69158 13.7766 3.96395 13.8856 4.50866 14.1035C5.06534 14.3261 5.35196 14.9441 5.16236 15.5129L4.94721 16.1584C4.79819 16.6054 4.72367 16.829 4.7169 17.0486C4.70875 17.3127 4.77049 17.5742 4.89587 17.8067C5.00015 18.0002 5.16678 18.1668 5.5 18.5C5.83323 18.8332 5.99985 18.9998 6.19325 19.1041C6.4258 19.2295 6.68733 19.2913 6.9514 19.2831C7.17102 19.2763 7.39456 19.2018 7.84164 19.0528L8.36862 18.8771C9.00393 18.6654 9.6942 18.9855 9.94291 19.6073C10.1159 20.0398 10.2024 20.2561 10.3346 20.4249C10.5281 20.6719 10.7942 20.8521 11.0954 20.94C11.3012 21 11.5341 21 12 21C12.4659 21 12.6988 21 12.9046 20.94C13.2058 20.8521 13.4719 20.6719 13.6654 20.4249C13.7976 20.2561 13.8841 20.0398 14.0571 19.6073C14.3058 18.9855 14.9961 18.6654 15.6313 18.8773L16.1579 19.0529C16.605 19.2019 16.8286 19.2764 17.0482 19.2832C17.3123 19.2913 17.5738 19.2296 17.8063 19.1042C17.9997 18.9999 18.1664 18.8333 18.4996 18.5001C18.8328 18.1669 18.9994 18.0002 19.1037 17.8068C19.2291 17.5743 19.2908 17.3127 19.2827 17.0487C19.2759 16.8291 19.2014 16.6055 19.0524 16.1584L18.8374 15.5134C18.6477 14.9444 18.9344 14.3262 19.4913 14.1035C20.036 13.8856 20.3084 13.7766 20.5088 13.5946C20.6858 13.4337 20.8218 13.2329 20.9054 13.0088C21 12.7551 21 12.4589 21 11.8663C21 11.3658 21 11.1156 20.9289 10.893C20.866 10.696 20.763 10.5141 20.6265 10.3588C20.4721 10.1833 20.2597 10.0558 19.8348 9.80087L19.5569 9.63416C18.9478 9.26867 18.6939 8.51514 18.9578 7.85558C19.1262 7.43443 19.2105 7.22383 19.232 7.01543C19.2636 6.70926 19.2003 6.40077 19.0506 6.13181C18.9487 5.94875 18.7884 5.78837 18.4676 5.46762C18.1658 5.16584 18.0149 5.01494 17.8426 4.91583C17.5894 4.77024 17.2992 4.70174 17.0076 4.71872C16.8091 4.73029 16.6067 4.79777 16.2018 4.93273L15.6314 5.12287C14.9961 5.33464 14.3058 5.0145 14.0571 4.39272C13.8841 3.96016 13.7976 3.74388 13.6654 3.57511C13.4719 3.32808 13.2058 3.14794 12.9046 3.06005Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> </g>
              </svg>
            </div>
            <span>Настройки</span>
          </button>
          <button className="styled-btn btn-export" onClick={exportShapeFile}>
            <div className="circle">
              <svg width="40px" height="40px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path fill="#000000" fillRule="evenodd" d="M14,9.00421 C14.5523,9.00421 15,9.45192 15,10.00418 L15,13.00418 C15,14.10878 14.1046,15.00418 13,15.00418 L3,15.00418 C1.89543,15.00418 1,14.10878 1,13.00418 L1,10.00418 C1,9.45192 1.44772,9.00421 2,9.00421 C2.55228,9.00421 3,9.45192 3,10.00418 L3,13.00418 L13,13.00418 L13,10.00418 C13,9.45192 13.4477,9.00421 14,9.00421 Z M8,1.59 L11.7071,5.2971 C12.0976,5.68763 12.0976,6.32079 11.7071,6.71132 C11.3166,7.10184 10.6834,7.10184 10.2929,6.71132 L9,5.41842 L9,10.00418 C9,10.55648 8.55228,11.00418 8,11.00418 C7.44772,11.00418 7,10.55648 7,10.00418 L7,5.41842 L5.70711,6.71132 C5.31658,7.10184 4.68342,7.10184 4.29289,6.71132 C3.90237,6.32079 3.90237,5.68763 4.29289,5.2971 L8,1.59 Z" />
              </svg>
            </div>
            <span>Экспорт</span>
          </button>
          <button className="styled-btn btn-import" onClick={importShapeFile}>
            <div className="circle">
              <svg width="40px" height="40px" viewBox="0 0 16 16" className="icon-svg" xmlns="http://www.w3.org/2000/svg">
                <path fill="#000000" fillRule="evenodd" d="M14,9 C14.5523,9 15,9.44772 15,10 L15,13 C15,14.1046 14.1046,15 13,15 L3,15 C1.89543,15 1,14.1046 1,13 L1,10 C1,9.44772 1.44772,9 2,9 C2.55228,9 3,9.44771 3,10 L3,13 L13,13 L13,10 C13,9.44771 13.4477,9 14,9 Z M8,1 C8.55228,1 9,1.44772 9,2 L9,6.58579 L10.2929,5.29289 C10.6834,4.90237 11.3166,4.90237 11.7071,5.29289 C12.0976,5.68342 12.0976,6.31658 11.7071,6.70711 L8,10.4142 L4.29289,6.70711 C3.90237,6.31658 3.90237,5.68342 4.29289,5.29289 C4.68342,4.90237 5.31658,4.90237 5.70711,5.29289 L7,6.58579 L7,2 C7,1.44772 7.44772,1 8,1 Z" />
              </svg>
            </div>
            <span>Импорт</span>
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
      </nav>
    </div>
  )
}

export default Home